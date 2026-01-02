import { Injectable } from "@nestjs/common";
import { EmailClient } from "@azure/communication-email";
import { KnownEmailSendStatus } from "node_modules/@azure/communication-email/dist/esm/models";

const connectionString = 'COMMUNICATION_SERVICES_CONNECTION_STRING';
const emailClient = new EmailClient(connectionString);

@Injectable()
export class EmailHelper {
    async sendEmail(mail: any): Promise<string> {
        const POLLER_WAIT_TIME = 10
        try {
            const message = {
                senderAddress: "<donotreply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net>",
                content: {
                    subject: "Welcome to Azure Communication Services Email",
                    plainText: "This email message is sent from Azure Communication Services Email using the JavaScript SDK.",
                },
                recipients: {
                    to: [
                    {
                        address: "<emailalias@emaildomain.com>",
                        displayName: "Customer Name",
                    },
                    ],
                },
            };

            const poller = await emailClient.beginSend(message);

            if (!poller.getOperationState().isStarted) {
                throw "Poller was not started."
            }

            let timeElapsed = 0;
            while(!poller.isDone()) {
                poller.poll();
                console.log("Email send polling in progress");

                await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
                timeElapsed += 10;

                if(timeElapsed > 18 * POLLER_WAIT_TIME) {
                    throw "Polling timed out.";
                }
            }

            if(poller.getResult().status === KnownEmailSendStatus.Succeeded) {
                console.log(`Successfully sent the email (operation id: ${poller.getResult().id})`);
            }
            else {
                throw poller.getResult().error;
            }
        } catch (e) {
            console.log(e);
        }
        return "Email sent successfully";
    }

    async sendMultipleRecipients(mail: any): Promise<string> {
        const message = {
            senderAddress: "<donotreply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net>",
            content: {
                subject: "Welcome to Azure Communication Service Email.",
                plainText: "<This email message is sent from Azure Communication Service Email using JS SDK.>"
            },
            recipients: {
                to: [
                {
                    address: "customer1@domain.com",
                    displayName: "Customer Name 1",
                },
                {
                    address: "customer2@domain.com",
                    displayName: "Customer Name 2",
                }
                ],
                cc: [
                {
                    address: "ccCustomer1@domain.com",
                    displayName: " CC Customer 1",
                },
                {
                    address: "ccCustomer2@domain.com",
                    displayName: "CC Customer 2",
                }
                ],
                bcc: [
                {
                    address: "bccCustomer1@domain.com",
                    displayName: " BCC Customer 1",
                },
                {
                    address: "bccCustomer2@domain.com",
                    displayName: "BCC Customer 2",
                }
                ]
            },
            replyTo: [
                {
                address: "replyToCustomer1@domain.com",
                displayName: "ReplyTo Customer 1",
                }
            ]
        };

        const poller = await emailClient.beginSend(message);
        const response = await poller.pollUntilDone();
        return "Email sent to multiple recipients successfully";
    }
}