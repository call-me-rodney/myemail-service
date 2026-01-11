# Email Service Workflow Documentation

## Overview
The email service now supports a complete workflow for sending emails with recipients, attachments, and conversation threading.

## Email Sending Workflow

### 1. Client Composes Email
When a client composes an email, the request should include:
- Email details (subject, content, etc.)
- **Recipients array** (to, cc, bcc)
- **Attachments array** (optional)
- **Conversation ID** (optional, for replies)

### 2. Request Structure

```typescript
POST /email

{
  "user_id": "uuid-of-user",
  "from_email": "sender@example.com",
  "from_name": "John Doe",
  "subject": "Meeting Tomorrow",
  "textcontent": "Let's meet tomorrow at 10 AM",
  "htmlcontent": "<p>Let's meet tomorrow at 10 AM</p>",
  "priority": "normal",
  "status": "draft", // or "sent" for immediate sending
  "scheduled_for": "2025-12-20T10:00:00Z", // optional
  
  // Recipients array - REQUIRED
  "recipients": [
    {
      "recipient_email": "recipient1@example.com",
      "recipient_name": "Jane Smith",
      "recipient_type": "to",
      "contact_id": "uuid-of-contact" // optional
    },
    {
      "recipient_email": "recipient2@example.com",
      "recipient_name": "Bob Johnson",
      "recipient_type": "cc"
    },
    {
      "recipient_email": "recipient3@example.com",
      "recipient_type": "bcc"
    }
  ],
  
  // Attachments array - OPTIONAL
  "attachments": [
    {
      "filename": "document.pdf",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      "storage_url": "https://storage.example.com/files/document.pdf",
      "storage_provider": "s3"
    }
  ],
  
  // Conversation ID - OPTIONAL (for replies)
  "conversation_id": "uuid-of-existing-conversation"
}
```

### 3. What Happens in the Backend

The `EmailService.create()` method uses a **database transaction** to ensure all operations succeed or fail together:

#### Step 1: Handle Conversation
- **If no conversation_id provided**: Creates a new conversation with all participant emails
- **If conversation_id exists**: Updates the existing conversation's last_message_at and increments message_count

#### Step 2: Create Email Record
- Creates the main email record in the `emails` table
- Links it to the conversation
- Sets default status to "draft" if not specified

#### Step 3: Create Recipient Records
- Bulk creates recipient records for all recipients (to, cc, bcc)
- Each recipient is stored separately in the `email_recipients` table
- Links to contact if contact_id is provided

#### Step 4: Create Attachment Records
- If attachments are provided, bulk creates attachment records
- Each attachment is stored in the `email_attachments` table
- Assumes files are already uploaded to storage (S3, Azure, etc.)

#### Step 5: Return Complete Email
- Returns the email with all associated data:
  - Recipients
  - Attachments
  - Conversation details

### 4. Sending the Email

After creating the email record, to actually send it:

```typescript
// 1. Send via email provider (AWS SES, SendGrid, etc.)
await emailProvider.send(emailData);

// 2. Mark as sent in database
await emailService.markAsSent(emailId);
```

## Additional Features

### Get Emails by Status
```typescript
// Get all drafts for a user
GET /email/user/:userId/status/draft

// Get all sent emails
GET /email/user/:userId/status/sent
```

### Get Conversation Thread
```typescript
// Get all emails in a conversation
GET /email/conversation/:conversationId
```

### Reply to Email
To reply to an email, include the `conversation_id` from the original email:

```typescript
POST /email
{
  "conversation_id": "existing-conversation-uuid",
  "subject": "Re: Meeting Tomorrow",
  // ... rest of email data
}
```

## Database Relations

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
┌──────▼──────────┐  ┌───▼──────────────┐
│  Conversations  │  │     Emails       │
└──────┬──────────┘  └───┬──────────────┘
       │                 │
       └────────┬────────┘
                │
       ┌────────┴────────┬─────────────┐
       │                 │             │
┌──────▼────────┐ ┌──────▼────────┐ ┌─▼────────┐
│  Recipients   │ │  Attachments  │ │  Email   │
└───────────────┘ └───────────────┘ └──────────┘
```

## Key Points

1. **Transaction Safety**: All database operations happen in a transaction, ensuring data consistency
2. **Conversation Threading**: Emails are automatically grouped into conversations
3. **Multiple Recipients**: Supports to, cc, and bcc recipients
4. **Attachment Support**: Multiple attachments per email
5. **Status Tracking**: Track emails through their lifecycle (draft → queued → sent)
6. **Contact Linking**: Recipients can be linked to contacts for better management

## Example Use Cases

### Use Case 1: Send Bulk Email
```typescript
const bulkEmail = {
  user_id: "user-uuid",
  from_email: "marketing@company.com",
  from_name: "Marketing Team",
  subject: "Newsletter",
  textcontent: "Check out our latest news...",
  recipients: [
    { recipient_email: "customer1@example.com", recipient_type: "to" },
    { recipient_email: "customer2@example.com", recipient_type: "to" },
    { recipient_email: "customer3@example.com", recipient_type: "to" },
    // ... more recipients
  ],
  status: "queued" // Queue for batch sending
};
```

### Use Case 2: Email with Multiple Attachments
```typescript
const emailWithAttachments = {
  user_id: "user-uuid",
  from_email: "sales@company.com",
  from_name: "Sales Team",
  subject: "Proposal Documents",
  textcontent: "Please find attached...",
  recipients: [
    { recipient_email: "client@example.com", recipient_type: "to" }
  ],
  attachments: [
    {
      filename: "proposal.pdf",
      file_size: 2048000,
      mime_type: "application/pdf",
      storage_url: "https://s3.amazonaws.com/bucket/proposal.pdf",
      storage_provider: "s3"
    },
    {
      filename: "contract.docx",
      file_size: 1024000,
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      storage_url: "https://s3.amazonaws.com/bucket/contract.docx",
      storage_provider: "s3"
    }
  ]
};
```

### Use Case 3: Reply in Conversation
```typescript
const reply = {
  user_id: "user-uuid",
  from_email: "user@company.com",
  from_name: "User Name",
  subject: "Re: Original Subject",
  textcontent: "Thank you for your email...",
  conversation_id: "existing-conversation-uuid", // Key: links to existing thread
  recipients: [
    { recipient_email: "original-sender@example.com", recipient_type: "to" }
  ]
};
```

## Status Enum Values
- `draft` - Email saved but not sent
- `scheduled` - Email scheduled for future sending
- `queued` - Email in sending queue
- `sent` - Email successfully sent
- `failed` - Email sending failed
- `pending` - Email pending processing
- `unread` - Received email not yet read
- `read` - Received email that has been read
- `bounced` - Email bounced back
- `trash` - Email moved to trash

## Priority Enum Values
- `low` - Low priority (default)
- `normal` - Normal priority
- `high` - High priority (urgent)
