import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { Email } from './models/email.model';
import { Recipients } from './models/recipient.model';
import { Attachments } from './models/attachment.model';
import { Conversations } from './models/conversation.model';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Status, Priority } from './types/enums.types';
import { WebhookEvent } from './types/int.types';
import { Webhook } from 'svix';
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
    private configService: ConfigService,
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
    const userObj = this.usersService.findByEmail(toAddress || '');

    if (!userObj) {
      throw new NotFoundException('Recipient user not found');
    }
    const user = (await userObj).toJSON();

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
          // status of these emails will be picked via webhooks, thus updates shall be made from there
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
          // status of these emails will be picked via webhooks, thus updates shall be made from there
        }
      }
    } else if (emailPayload.status === Status.Draft) {
      return;
    }
  }

  async handleOutboundStatus(headers: any, payload: any): Promise<void | string> {
    const webhookSecret = this.configService.get<string>('RESEND_WEBHOOK_SECRET');
    const webhook = new Webhook(webhookSecret || '');
    const event = webhook.verify(payload, headers) as WebhookEvent;

    if (event.type === 'email.sent') {
      // verify the email specified in the to email field exists in our users table
      const toAddress = event.data.to[0];
      const userObj = this.usersService.findByEmail(toAddress || '');

      if (!userObj) {
        throw new NotFoundException('Recipient user not found');
      }
      const user = (await userObj).toJSON();
      const emailsObj = this.emailModel.findAll({
        where: {
          user_id: user.id,
          subject: event.data.subject || '(No Subject)',
        },
        order: [['created_at', 'DESC']],
      });
      const emails = emailsObj.then(results => results.map(email => email.toJSON()));
      const latestEmail = (await emails)[0];

      if (latestEmail) {
        await this.markAsSent(latestEmail.id);
      }
      return `Email sent successfully`;
    } else if (event.type === 'email.failed') {
      // verify the email specified in the to email field exists in our users table
      const toAddress = event.data.to[0];
      const userObj = this.usersService.findByEmail(toAddress || '');

      if (!userObj) {
        throw new NotFoundException('Recipient user not found');
      }
      const user = (await userObj).toJSON();
      const emailsObj = this.emailModel.findAll({
        where: {
          user_id: user.id,
          subject: event.data.subject || '(No Subject)',
        },
        order: [['created_at', 'DESC']],
      });
      const emails = emailsObj.then(results => results.map(email => email.toJSON()));
      const latestEmail = (await emails)[0];

      if (latestEmail) {
        await this.update(latestEmail.id, { status: Status.Failed } as UpdateEmailDto);
      }
      return `Email delivery failed`;
    }
  }
}
