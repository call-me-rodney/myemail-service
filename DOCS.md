# ENTERPRISE GRADE EMAIL SERVICE
## OBECTIVES
- Learn nestjs
- Improve react + vite skills
- Practice docker and kubernetes
- Learn writing shell scripts
- Prove dev skills

## PROJECT OVERVIEW
### Description
An enterprise grade emailing service

### Core System Functions
- Single & bulk email sending
- Mailing list management
- unsubscribe/bounce handling  
- GDPR compliance tracking
- Enterprise Email template builder with HTML editor for adavanced users (drag and drop for regulars).
- Real-time analytics and metrics, with ability to export reports to a specific format
- Campaign builder

### Proposed Tech Stack
- Backend: Nestjs
- Frontend: Vite + React
- Database: Postgresql (Neon)
- Containerization: Docker
- Deployement: Azure
- Cache Database: Redis
- Event Queue: Kafka
- External Email Providers: AWS SES/Azure Mail Server

### Requirements
- scalable (docker,azure,redis,kafka)
- Reliable (docker,kafka,azure)
- Security (nestjs)
- Compliance (heavy research required)
- Email provider switching incase of faiure of main
- ERP & CRM integrations (for automatic emailing, content management, ad campaigns etc)
- AI powered
- Spam detection
- Audit logs
- workflow automation
- warmup automation (research)
- dedicated IP pools (research)

## FUNCTIONAL BREAKDOWN
### Sending and receiving emails (single/bulk)
#### WORKFLOW
A client chooses the compose option on their dashboards which will prompt a pop up window that will prompt for sending details, contents and attachments if any. Once the mail is composed, clients can choose to send the email immediately or schedule a send date. The composed email object is passed through the backend to be validated, saved and prepared for transit likely by the email provider to the given email address(es). This will also require a separate UI tab for tracking and editing scheduled emails. The system must also be able to keep track of email conversations so as to maintain the conversation thread.

#### Frontend requirements.
- User email dashboard
- Compose button
- Editor pop up window
- Text box, To: From: specification, @s, attaching (with payload size limit), send/schedule send, etc.
- option to cancel email composing.
- option to send unsent composed emails to drafts for future sending or editing.
- tab for managing scheduled emails.
- calendar highlighting marked events and email sending schedules.
- Tabs for inbox, read, sent, drafts, trash emails.

#### Backend requirements.
- CRUD endpoints for email management, sending, receiving etc
- email database schema
- user accounts, database schema, and auth workflow
- email service provider or sending emails.

#### Backend modules
- email: Endpoints for creating emails, fetching user relevant emails from db, updating drafted emails, deleting drafted, sent and read emails.
- contacts: Endpoints for creating, editing, fetching and deleting contacts
- auth: Endpoints for registration, login, logout, sessions, Oauth
- users: Endpoints for creating, fetching, editing and deleting users(admin previledges)

#### Suggested database schemas
1. Email schema.
```json
{
    "id":"uuid",
    "user_id":"foreignkey",
    "from_email":"email",
    "from_name":"string",
    "reply_to":"email",
    "subject":"string",
    "conversationid":"string",
    "textContent":"string",
    "html_content":"string",
    "created_at":"datetime",
    "updated_at":"datetime",
    "deleted_at":"datetime",
    "priority":["low","meduim","high"],
    "tags":["read","unread","draft","trash","sent"],
    "status":["draft","scheduled","queued","sending","sent","failed"],
    "sent_at":"datetime",
    "scheduled_for":"datetime"
}
```

2. Contact schema.
```json
{
    "id":"uuid",
    "user_id":"foreignkey",
    "fname":"string",
    "lname":"string",
    "email_address":"email",
    "phone":"string",
    "tags":["customer","vendor"],
    "company":"string",
    "timezone":"string",
    "address":"string"
}
```

3. User schema.
```json
{
    "id":"uuid",
    "fname":"string",
    "lname":"string",
    "email":"email",
    "dob":"date",
    "password":"string",
    "phonenumber":"string",
    "timezone":"string",
    "role":["user,admin"],
    "daily_send_limit":"integer",
    "created_at":"datetime",
    "lastLogin":"datetime",
    "created_by":"foreignkey",
    "is_active":"boolean",
    "is_verified":"boolean",
    "verified_at":"datetime"

}
```

4. Attachments schema.
```json
{
    "id": "uuid",
    "email_id": "foreignkey",
    "filename": "string",
    "file_size": "integer",
    "mime_type": "string",
    "storage_url": "string",
    "storage_provider": "enum(s3,azure_blob)",
    "uploaded_at": "datetime"
}
```

5. Email reipients schema.
```json
{
    "id": "uuid",
    "email_id": "foreignkey",
    "recipient_email": "string",
    "recipient_name": "string|null",
    "recipient_type": "enum(to,cc,bcc)",
    "contact_id": "foreignkey|null"
}
```

6. Conversations.
```json
{
    "id": "uuid",
    "user_id": "foreignkey",
    "subject": "string",
    "participants": "jsonb",
    "last_message_at": "datetime",
    "message_count": "integer",
    "created_at": "datetime"
}
```