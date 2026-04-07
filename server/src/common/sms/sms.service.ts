import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly client: twilio.Twilio;
  private readonly from: string;
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = twilio(
      this.configService.get<string>('twilio.accountSid'),
      this.configService.get<string>('twilio.authToken'),
    );
    this.from = this.configService.get<string>('twilio.fromNumber') || '';
  }

  async send(to: string, body: string): Promise<void> {
    try {
      await this.client.messages.create({ from: this.from, to, body });
    } catch (err) {
      this.logger.error(`SMS failed to ${to}: ${err.message}`);
    }
  }
}
