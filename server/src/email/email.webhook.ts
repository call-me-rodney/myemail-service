import { Controller, Post, Body, HttpCode, Req } from '@nestjs/common';
import { EmailService } from './email.service';
import { WebhookRequiredHeaders } from 'svix';

@Controller('email/webhooks')
export class EmailWebhooksController {
  constructor(private readonly emailService: EmailService) {}

  /*post route for sending emails that have been sent from external email domain
  makes use of emailService.markAsSent
  */
  // cloudflare 
  @Post('/inbound')
  @HttpCode(200)
  handleInbound(@Body() body: { raw: string }) {
    return this.emailService.handleInboundMail(body.raw);
  }

  // resend
  @Post("/outbound")
  @HttpCode(200)
  handleOutboundStatus(@Req () req: any) {
    const headers = req.headers as WebhookRequiredHeaders;
    const payload = req.toJSON();
    return this.emailService.handleOutboundStatus(headers, payload);
  }
}