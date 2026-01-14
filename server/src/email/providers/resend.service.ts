import { Injectable } from "@nestjs/common";
import { Resend } from 'resend';

@Injectable()
export class ResendService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend("re_ZH55Hv8C_B41Rvweq1mi632xFHLsnzMhK");
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