import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Email } from './models/email.model';
import { Recipients } from './models/recipient.model';
import { Conversations } from './models/conversation.model';
import { Attachments } from './models/attachment.model';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailWebhooksController } from './email.webhook';
import { EmailGateway } from './providers/websocket.service';
import { UsersModule } from 'src/users/users.module';
import { ResendService } from './providers/resend.service';

@Module({
  imports: [SequelizeModule.forFeature([Email, Recipients, Conversations, Attachments]), UsersModule],
  controllers: [EmailController, EmailWebhooksController],
  providers: [EmailService,EmailGateway,ResendService],
})
export class EmailModule {}
