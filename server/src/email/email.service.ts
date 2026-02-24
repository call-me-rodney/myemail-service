import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Email } from './models/email.model';
import { Recipients } from './models/recipient.model';
import { Attachments } from './models/attachment.model';
import { Conversations } from './models/conversation.model';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Status, Priority } from './types/enums.types';
import { simpleParser} from 'mailparser';
import { UsersService } from 'src/users/users.service';
import emailjs, { EmailJSResponseStatus } from '@emailjs/nodejs';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(Email) private emailModel: typeof Email,
    @InjectModel(Recipients) private recipientsModel: typeof Recipients,
    @InjectModel(Attachments) private attachmentsModel: typeof Attachments,
    @InjectModel(Conversations) private conversationsModel: typeof Conversations,
    private sequelize: Sequelize,
    private usersService: UsersService,
    // private configService: ConfigService,
  ) {}
  private readonly logger = new Logger(EmailService.name);

  // create new email record with recipients, attachments, and conversation
  async create(createEmailDto: CreateEmailDto): Promise<Email> {
    // Use transaction to ensure all records are created atomically
    return this.sequelize.transaction(async (transaction) => {
      // log dto for debugging
      this.logger.log(`Creating email with DTO: ${JSON.stringify(createEmailDto)}`);
      const { recipients, attachments, conversation_id, ...emailData } = createEmailDto;

      // Fetch user data to populate from_name if not provided
      const user = await this.usersService.findOne(createEmailDto.user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If from_name is not provided, construct it from user data
      let fromName = emailData.from_name;
      if (!fromName || fromName.trim() === '') {
        fromName = `${user.fname} ${user.lname}`.trim();
      }

      // Step 1: Handle conversation
      let conversationId = conversation_id;
      
      if (!conversationId) {
        // Create new conversation if none exists
        const participantEmails = recipients.map(r => r.recipient_email);
        const conversation = await this.conversationsModel.create(
          {
            user_id: createEmailDto.user_id,
            subject: createEmailDto.subject,
            participant_emails: JSON.stringify(participantEmails),
            message_count: 1,
            last_message_at: new Date(),
            created_at: new Date(),
          } as any,
          { transaction },
        );
        conversationId = conversation.id;
      } else {
        // Update existing conversation
        await this.conversationsModel.update(
          {
            last_message_at: new Date(),
            message_count: this.sequelize.literal('message_count + 1'),
          } as any,
          {
            where: { id: conversationId },
            transaction,
          },
        );
      }

      // Step 2: Create email record
      const email = await this.emailModel.create(
        {
          ...emailData,
          from_name: fromName,
          conversation_id: conversationId,
          status: emailData.status || Status.Draft,
          priority: emailData.priority || Priority.Low,
          created_at: new Date(),
        } as any,
        { transaction },
      );

      // Step 3: Create recipient records
      if (recipients && recipients.length > 0) {
        const recipientRecords = recipients.map((recipient) => ({
          email_id: email.id,
          recipient_email: recipient.recipient_email,
          recipient_name: recipient.recipient_name,
          recipient_type: recipient.recipient_type,
          contact_id: recipient.contact_id,
        }));

        await this.recipientsModel.bulkCreate(recipientRecords as any, {
          transaction,
        });
      }

      // Step 4: Create attachment records if any
      if (attachments && attachments.length > 0) {
        const attachmentRecords = attachments.map((attachment) => ({
          email_id: email.id,
          filename: attachment.filename,
          file_size: attachment.file_size,
          mime_type: attachment.mime_type,
          storage_url: attachment.storage_url,
          storage_provider: attachment.storage_provider,
          uploaded_at: attachment.uploaded_at || new Date(),
        }));

        await this.attachmentsModel.bulkCreate(attachmentRecords as any, {
          transaction,
        });
      }

      // Step 5: Fetch and return the complete email with associations
      const completeEmail = await this.emailModel.findByPk(email.id, {
        include: [
          { model: Recipients, as: 'recipients' },
          { model: Attachments, as: 'attachments' },
          { model: Conversations, as: 'conversation' },
        ],
        transaction,
      });

      if (!completeEmail) {
        throw new Error('Failed to retrieve created email');
      }
      
      // log email object for debugging
      this.logger.log(`Created email: ${JSON.stringify(completeEmail.toJSON())}`);
      // Handle outbound mail if status is pending
      this.handleSingleMail(completeEmail);
      return completeEmail.toJSON();
    });
  }

  // fetch all records for the admin
  async findAll(): Promise<Email[]> {
    const emails = await this.emailModel.findAll({
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
    });

    if (!emails) {
      throw new NotFoundException('No emails found');
    }

    return emails.map(email => email.toJSON());
  }

  // Fetch multiple emails for a specific user
  async findMultiple(user_id: string): Promise<Email[]> {
    // Get user's email address for recipient lookup
    const user = await this.usersService.findOne(user_id);
    const userEmail = user.email;

    // Find all email IDs where the user is a recipient
    const recipientRecords = await this.recipientsModel.findAll({
      where: {
        recipient_email: userEmail,
      },
      attributes: ['email_id'],
    });
    const receivedEmailIds = recipientRecords.map(r => r.email_id);

    // Fetch all emails where:
    // 1. User created the email (user_id matches), OR
    // 2. User is a recipient (email_id is in receivedEmailIds)
    const emails = await this.emailModel.findAll({
      where: {
        [Op.or]: [
          { user_id: user_id },
          { to_email: userEmail },
          { id: { [Op.in]: receivedEmailIds } },
        ],
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
      order: [['created_at', 'DESC']],
    });

    if (!emails || emails.length === 0) {
      throw new NotFoundException('No emails found for the user');
    }

    return emails.map(email => email.toJSON());
  }  

  // Get emails by conversation ID
  async findByConversation(conversationId: string): Promise<Email[]> {
    const emails = await this.emailModel.findAll({
      where: {
        conversation_id: conversationId,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
      ],
      order: [['created_at', 'ASC']],
    });

    if (!emails || emails.length === 0) {
      throw new NotFoundException('No emails found for the conversation');
    }

    return emails.map(email => email.toJSON());
  }

  // Get emails by status for a user
  async findByStatus(user_id: string, status: Status): Promise<Email[]> {
    const emails = await this.emailModel.findAll({
      where: {
        user_id: user_id,
        status: status,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
      order: [['created_at', 'DESC']],
    });

    if (!emails || emails.length === 0) {
      throw new NotFoundException(`No emails found with status: ${status}`);
    }

    return emails.map(email => email.toJSON());
  }

  //fetch a single email record for a client
  async findOne(id: string): Promise<Email> {
    const email = await this.emailModel.findOne({
      where: {
        id: id,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
    });
    if (!email) {
      throw new NotFoundException('Email not found');
    }
    return email.toJSON();
  }

  //update single email record or client
  async update(id: string, updateEmailDto: UpdateEmailDto): Promise<Email> {
    const email = await this.emailModel.findOne({
      where: {
        id: id,
      },
    });
    if (email) {
      await email.update(updateEmailDto as any);
      return email.toJSON();
    }
    throw new NotFoundException('Email not found');
  }

  //delete single email record for client
  async remove(id: string): Promise<string> {
    const email = await this.emailModel.findOne({
      where: {
        id: id,
      },
    });
    if (email) {
      await email.destroy();
      return `This action removes a #${id} email`;
    }
    throw new NotFoundException('Email not found');
  }

  // Mark email as sent (to be called after successful sending via email provider)
  async markAsSent(id: string): Promise<void> {
    const email = await this.emailModel.findByPk(id);

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    await email.update({
      status: Status.Sent,
      sent_at: new Date(),
    } as any);

    // return email.toJSON();
  }

  async handleInboundMail(rawEmail: string): Promise<void> {
    const parsedEmail = await simpleParser(rawEmail);

    // verify the email specified in the to email field exists in our users table
    const toAddress = Array.isArray(parsedEmail.to) 
      ? parsedEmail.to[0]?.text 
      : parsedEmail.to?.text;
    const userObj = await this.usersService.findByEmail(toAddress || '');

    if (!userObj) {
      throw new NotFoundException('Recipient user not found');
    }
    const user = userObj.toJSON();

    // save necessary details to DB and send jsonified email via websocket to client instead of raw email
    const emailsObj = this.emailModel.findAll({
      where: {
        user_id: user.id,
        subject: parsedEmail.subject || '(No Subject)',
      },
      order: [['created_at', 'DESC']],
    });
    const emails = emailsObj.then(results => results.map(email => email.toJSON()));

    if (emails && (await emails).length === 0) {
      // create new conversation
      const newEmail: CreateEmailDto = {
        user_id: user.id,
        from_email: parsedEmail.from?.text || '',
        from_name: parsedEmail.from?.value[0]?.name || '',
        subject: parsedEmail.subject || '(No Subject)',
        textcontent: parsedEmail.text || '',
        status: Status.Pending,
        priority: Priority.Low,
        recipients: [],
        attachments: [],
      };
      await this.create(newEmail);
    } else {
      const conversationId = emails[0].conversation_id;
      const newEmail: CreateEmailDto = {
        user_id: user.id,
        from_email: parsedEmail.from?.text || '',
        from_name: parsedEmail.from?.value[0]?.name || '',
        subject: parsedEmail.subject || '(No Subject)',
        textcontent: parsedEmail.text || '',
        conversation_id: conversationId,
        status: Status.Pending,
        priority: Priority.Low,
        recipients: [],
        attachments: [],
      };
      await this.create(newEmail);
    }
  }

  async handleSingleMail(emailPayload: Email): Promise<void> {
    const send_time = new Date();
    const email = emailPayload.toJSON();
    emailjs.init({
      publicKey:'zQXdkPnjzkxtZJ8rW',
      privateKey:'YruEG3HwAbeEQIJBHVjay',
    })

    const templateParams = {
      title: email.subject,
      name: email.from_name, 
      from_name: email.from_name,
      time: send_time.toDateString(),
      message: email.textcontent,
      to_email: email.to_email,
      from_email: email.from_email,
    }

    try {
      const response = await emailjs.send("service_x7sgsil","template_8w8ybsv",templateParams);
      this.logger.log(`Success: ${response.status} - ${response.text}`);
      await this.markAsSent(emailPayload.id);
    } catch (err) {
      if (err instanceof EmailJSResponseStatus) {
        this.logger.error(`Error: ${JSON.stringify(err)}`);
        return;
      }
    }
  }

  async handleBulkMail(emailPayload: CreateEmailDto, mailingList: string[]): Promise<Email> {
    // First, save the email to the database using the create function
    const savedEmail = await this.create(emailPayload);

    // Initialize EmailJS
    emailjs.init({
      publicKey: 'zQXdkPnjzkxtZJ8rW',
      privateKey: 'YruEG3HwAbeEQIJBHVjay',
    });

    const send_time = new Date();

    // Send email to each address in the mailing list
    const sendPromises = mailingList.map(async (recipientEmail: string) => {
      const templateParams = {
        title: savedEmail.subject,
        name: savedEmail.from_name,
        to_email: recipientEmail,
        time: send_time.toDateString(),
        message: savedEmail.textcontent,
        from_name: savedEmail.from_name,
        from_email: savedEmail.from_email,
      };

      try {
        const response = await emailjs.send("gmail_service", "test_template", templateParams);
        console.log(`SUCCESS! Email sent to ${recipientEmail}`, response.status, response.text);
        return { email: recipientEmail, success: true };
      } catch (err) {
        if (err instanceof EmailJSResponseStatus) {
          console.log(`Error sending to ${recipientEmail}:`, err);
          return { email: recipientEmail, success: false, error: err };
        }
      }
    });

    // Wait for all emails to be sent
    await Promise.all(sendPromises);

    // Mark as sent after successful sending
    await this.markAsSent(savedEmail.id);

    return savedEmail;
  }
}

