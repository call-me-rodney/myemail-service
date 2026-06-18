import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotifyParams } from "../types/int.types";
import emailjs, { EmailJSResponseStatus } from '@emailjs/nodejs';

@Injectable()
export class EmailNotificationService {
  constructor(
    private configService: ConfigService,
  ) {}
  private readonly logger = new Logger(EmailNotificationService.name);
    
  async sendNotification (notifyParams: NotifyParams): Promise<void | string>{
    // send confirmation email instead
        const send_time = new Date();
        emailjs.init({
          publicKey: this.configService.get<string>('emailjs.publickey'),
          privateKey: this.configService.get<string>('emailjs.privatekey'),
        })
    
        const templateParams = {
          title: notifyParams.title,
          name: notifyParams.name, 
          from_name: notifyParams.from_name,
          time: send_time.toDateString(),
          message: notifyParams.message,
          to_email: notifyParams.to_email,
          from_email: notifyParams.from_email,
        }
    
        try {
          const response = await emailjs.send("service_x7sgsil","template_8w8ybsv",templateParams);
          this.logger.log(`Success: ${response.status} - ${response.text}`);
          return "Notification email sent successfully."
        } catch (err) {
          if (err instanceof EmailJSResponseStatus) {
            this.logger.error(`Error: ${JSON.stringify(err)}`);
            return "Problem occured while sending email."
          }
        }
  }
}