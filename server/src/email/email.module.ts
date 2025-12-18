import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Email } from './models/email.model';
import { Recipients } from './models/recipient.model';
import { Conversations } from './models/conversation.model';
import { Attachments } from './models/attachment.model';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [SequelizeModule.forFeature([Email, Recipients, Conversations, Attachments])],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
