import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly client: twilio.Twilio;
  private readonly from: string;
  private readonly logger = new Logger(SmsService.name);

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.from = process.env.TWILIO_FROM_NUMBER || '';
  }

  async send(to: string, body: string): Promise<void> {
    try {
      await this.client.messages.create({ from: this.from, to, body });
    } catch (err) {
      this.logger.error(`SMS failed to ${to}: ${err.message}`);
    }
  }
}
