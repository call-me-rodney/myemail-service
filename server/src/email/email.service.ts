import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Email } from './models/email.model';
import { Recipients } from './models/recipient.model';
import { Attachments } from './models/attachment.model';
import { Conversations } from './models/conversation.model';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Status, Priority } from './types/enums.types';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(Email) private emailModel: typeof Email,
    @InjectModel(Recipients) private recipientsModel: typeof Recipients,
    @InjectModel(Attachments) private attachmentsModel: typeof Attachments,
    @InjectModel(Conversations) private conversationsModel: typeof Conversations,
    private sequelize: Sequelize,
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

      return completeEmail;
    });
  }

  // fetch all records for the admin
  async findAll(): Promise<Email[]> {
    return this.emailModel.findAll({
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
    });
  }

  // Fetch multiple emails for a specific user
  async findMultiple(user_id: string): Promise<Email[]> {
    return this.emailModel.findAll({
      where: {
        user_id,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
    });
  }  

  // Get emails by conversation ID
  async findByConversation(conversationId: string): Promise<Email[]> {
    return this.emailModel.findAll({
      where: {
        conversation_id: conversationId,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
      ],
      order: [['created_at', 'ASC']],
    });
  }

  // Get emails by status for a user
  async findByStatus(user_id: string, status: Status): Promise<Email[]> {
    return this.emailModel.findAll({
      where: {
        user_id,
        status,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  //fetch a single email record for a client
  async findOne(id: string): Promise<Email> {
    const email = await this.emailModel.findOne({
      where: {
        id,
      },
      include: [
        { model: Recipients, as: 'recipients' },
        { model: Attachments, as: 'attachments' },
        { model: Conversations, as: 'conversation' },
      ],
    });
    if (!email) {
      throw new Error('Email not found');
    }
    return email;
  }

  //update single email record or client
  async update(id: string, updateEmailDto: UpdateEmailDto): Promise<Email> {
    const email = await this.emailModel.findOne({
      where: {
        id,
      },
    });
    if (email) {
      await email.update(updateEmailDto as any);
      return email;
    }
    throw new Error('Email not found');
  }

  //delete single email record for client
  async remove(id: string): Promise<string> {
    const email = await this.emailModel.findOne({
      where: {
        id,
      },
    });
    if (email) {
      await email.destroy();
      return `This action removes a #${id} email`;
    }
    throw new Error('Email not found');
  }

  // Mark email as sent (to be called after successful sending via email provider)
  async markAsSent(id: string): Promise<Email> {
    const email = await this.emailModel.findByPk(id);
    if (!email) {
      throw new Error('Email not found');
    }

    await email.update({
      status: Status.Sent,
      sent_at: new Date(),
    } as any);

    return this.findOne(id);
  }
}
