import { Injectable } from "@nestjs/common";
import { Resend } from 'resend';

@Injectable()
export class ResendService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendEmail(to: string, subject: string, html: string, from?: string) {
        return this.resend.emails.send({
            from: from || 'onboarding@resend.dev',
            to,
            subject,
            html,
        });
    }
}