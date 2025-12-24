## EMAIL ROUTES

### POST - /email/
#### Request
```json
{
  "user_id": "string(UUID)",
  "from_email": "string(email)",
  "from_name": "string",
  "subject": "string",
  "textcontent": "string",
  "htmlcontent": "string",
  "priority": "string(enum(low,meduim,high))",
  "status": "string(enum())", // or "sent" for immediate sending
  "scheduled_for": "date string", // optional
  
  // Recipients array - REQUIRED
  "recipients": [
    {
      "recipient_email": "string(email)",
      "recipient_name": "string",
      "recipient_type": "string(enum(to,bcc,cc))",
      "contact_id": "string(UUID)" // optional
    },
    {
      "recipient_email": "string(email)",
      "recipient_name": "string",
      "recipient_type": "string(enum(to,bcc,cc))"
    },
    {
      "recipient_email": "string(email)",
      "recipient_type": "string(enum(to,bcc,cc))"
    }
  ],
  
  // Attachments array - OPTIONAL
  "attachments": [
    {
      "filename": "string",
      "file_size": "integer",
      "mime_type": "string",
      "storage_url": "string(URL)",
      "storage_provider": "string(enum(#))"
    }
  ],
  
  // Conversation ID - OPTIONAL (for replies)
  "conversation_id": "string(UUID)"
}
```

#### Example
```json
{
  "user_id": "9f4f5f54-7b13-4d6f-9c3c-2b1e9c0e4c11",
  "from_email": "sender@example.com",
  "from_name": "Sender Name",
  "subject": "Quarterly report",
  "conversation_id": "0a7c2f8a-2c3b-4e1f-9e6e-b0f0f1a2b3c4",
  "textcontent": "Hi team, please find the report attached.",
  "htmlcontent": "<p>Hi team,<br/>Please find the report attached.</p>",
  "priority": "high",
  "status": "queued",
  "scheduled_for": "2025-12-20T10:00:00.000Z",
  "recipients": [
    {
      "recipient_email": "to.person@example.com",
      "recipient_name": "To Person",
      "recipient_type": "to",
      "contact_id": null
    },
    {
      "recipient_email": "cc.person@example.com",
      "recipient_name": "CC Person",
      "recipient_type": "cc",
      "contact_id": null
    }
  ],
  "attachments": [
    {
      "filename": "report.pdf",
      "file_size": 245678,
      "mime_type": "application/pdf",
      "storage_url": "https://storage.example.com/report.pdf",
      "storage_provider": "s3"
    }
  ]
}
```

## USER ROUTES
### POST /user/
#### Request
```json
{
  "fname": "string",
  "lname": "string",
  "email": "string(email)",
  "dob": "string(Date string)",
  "password": "string(password)",
  "phone": "string",
  "timezone": "string",
  "role": "string(enum)" // or another value from Roles enum
}
```

#### Example
```json
{
  "fname": "John",
  "lname": "Doe",
  "email": "john.doe@example.com",
  "dob": "1990-05-10",
  "password": "StrongPass123!",
  "phone": "+1234567890",
  "timezone": "America/New_York",
  "role": "admin" // or another value from Roles enum
}
```

### PATCH /users/deactivate/:id

## AUTH ROUTES

### POST /auth/register
#### Request
```json
{
  "fname": "string",
  "lname": "string",
  "email": "string(email)",
  "dob": "string(Date string)",
  "password": "string(password)",
  "phone": "string",
  "timezone": "string",
  "role": "string(enum)" // or another value from Roles enum
}
```

### POST /auth/login
#### Register
```json
{
  "email":"string(email)",
  "password":"string"
}
```
