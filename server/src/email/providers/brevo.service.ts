import { Injectable } from "@nestjs/common";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

@Injectable()
export class BrevoService {

    async sendTestEmail(payload: any): Promise<void> {
        let emailAPI = new TransactionalEmailsApi();
        (emailAPI as any).authentications.apiKey.apiKey = "xkeysib-xxxxxxxxxxxxxxxxxxxxx";

        let message = new SendSmtpEmail();
        message.subject = payload.subject;
        message.textContent = payload.textContent || "Hello world!";
        message.sender = { name: payload.senderName || "Bob Wilson", email: payload.senderEmail || "bob.wilson@example.com" };
        message.to = [{ email: payload.recipientEmail || "sarah.davis@example.com", name: payload.recipientName || "Sarah Davis" }];

        await emailAPI
        .sendTransacEmail(message)
        .then((res) => {
            console.log(JSON.stringify(res.body));
        })
        .catch((err) => {
            console.error("Error sending email:", err.body);
        });
    }
}