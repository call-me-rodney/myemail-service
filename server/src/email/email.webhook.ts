import { Controller, Post, Body, HttpCode, Req } from '@nestjs/common';
import { EmailService } from './email.service';
import { WebhookRequiredHeaders } from 'svix';

@Controller('email/webhooks')
export class EmailWebhooksController {
  constructor(private readonly emailService: EmailService) {}

  // cloudflare 
  @Post('/inbound')
  @HttpCode(200)
  handleInbound(@Body() body: { raw: string }) {
    return this.emailService.handleInboundMail(body.raw);
  }
}