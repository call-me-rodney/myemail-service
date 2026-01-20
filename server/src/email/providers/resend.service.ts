import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from 'resend';

@Injectable()
export class ResendService {
    constructor(
        private configService: ConfigService,
    ) {}

    async sendEmail(to: string, subject: string, html: string, from?: string) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
        const resend = new Resend(apiKey);
        return resend.emails.send({
            from: from || 'onboarding@resend.dev',
            to,
            subject,
            html,
        });
    }
}
