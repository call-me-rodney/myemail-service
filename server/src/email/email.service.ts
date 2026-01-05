import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Email } from './models/email.model';
import { Recipients } from './models/recipient.model';
import { Attachments } from './models/attachment.model';
import { Conversations } from './models/conversation.model';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Status, Priority } from './types/enums.types';
import { EmailGateway} from './providers/websocket.service';
import { simpleParser} from 'mailparser';
import { UsersService } from 'src/users/users.service';
import { ResendService } from './providers/resend.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(Email) private emailModel: typeof Email,
    @InjectModel(Recipients) private recipientsModel: typeof Recipients,
    @InjectModel(Attachments) private attachmentsModel: typeof Attachments,
    @InjectModel(Conversations) private conversationsModel: typeof Conversations,
    private sequelize: Sequelize,
    private emailGateway: EmailGateway,
    private usersService: UsersService,
    private resendService: ResendService,
  ) {}

  // create new email record with recipients, attachments, and conversation
  async create(createEmailDto: CreateEmailDto): Promise<Email> {
    // Use transaction to ensure all records are created atomically
    return this.sequelize.transaction(async (transaction) => {
      const { recipients, attachments, conversation_id, ...emailData } = createEmailDto;

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
    
      // Handle outbound mail if status is pending
      this.handleOutboundMail(completeEmail);
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
    const emails = await this.emailModel.findAll({
      where: {
        user_id:user_id,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
    });

    if (!emails) {
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
    const user = this.usersService.findByEmail(toAddress || '');

    if (!user) {
      // throw new NotFoundException('Recipient user not found');
      return;
    }
    // save necessary details to DB and send jsonified email via websocket to client instead of raw email
    this.emailGateway.server.to((await user).id).emit('new_mail', parsedEmail);
  }

  async handleOutboundMail(emailPayload: Email): Promise<void> {
    // check status of mail
    if (emailPayload.status === Status.Pending) {
      // determine whether its multiple recipients or not
      if (emailPayload.recipients.length > 1) {
        const internalRecipients = emailPayload.recipients.filter(r => r.recipient_email.includes("brevomail.me"));
        const externalRecipients = emailPayload.recipients.filter(r => !r.recipient_email.includes("brevomail.me"));

        if (internalRecipients.length > 0) {
          const userIds = await Promise.all(
            internalRecipients.map(async r => (await this.usersService.findByEmail(r.recipient_email)).id),
          );
          this.emailGateway.sendNewEmailNotificationToMany(
            userIds,
            emailPayload.toJSON(),
          );

          this.markAsSent(emailPayload.id);
        }
        if (externalRecipients.length > 0) {
          // send via smtp relay
          await this.resendService.sendEmail(
            externalRecipients.map(r => r.recipient_email).join(', '),
            emailPayload.subject,
            emailPayload.textcontent,
            emailPayload.from_email,
          );
          // mark as sent after status is polled from relay
        }
      }else if (emailPayload.recipients.length === 1) {
        // check whether its bound for internal or external domains
        if (emailPayload.recipients[0].recipient_email.includes("brevomail.me")) {
          const user = await this.usersService.findByEmail(emailPayload.recipients[0].recipient_email);
          this.emailGateway.sendNewEmailNotificationToUser(user.id, emailPayload.toJSON());

          // mark the email record as sent
          this.markAsSent(emailPayload.id);
        } else {
          // send via smtp relay
          await this.resendService.sendEmail(
            emailPayload.recipients[0].recipient_email,
            emailPayload.subject,
            emailPayload.textcontent,
            emailPayload.from_email,
          );
          // mark as sent after status is polled from relay
        }
      }
    } else if (emailPayload.status === Status.Draft) {
      return;
    }
  }
}
