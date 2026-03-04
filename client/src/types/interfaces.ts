// client/src/types/interfaces.ts

// User creation DTO for registration endpoint
export interface CreateUserDTO {
  fname: string;
  lname: string;
  dob: string;
  company: string;
  phone: string;
  timezone: string;
}

// Auth response - both login and register return the same format
export interface AuthResponse {
  userid: string;
  role: 'user' | 'company admin' | 'super admin' | 'admin';
  accessToken: string;
  email: string;
  name: string; // Full name: fname lname
  company: string;
}

export interface CompanyUser {
  id: string;
  fname: string;
  lname: string;
  dob: string;
  timezone: string;
  company: string;
  role?: string;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface VerificationRequestPayload {
  userid: string;
  verified_by: string;
  role: 'user' | 'company admin';
}

export type EmailPriority = 'low' | 'normal' | 'high';
export type EmailStatus = 'draft' | 'scheduled' | 'queued' | 'sent' | 'failed' | 'pending' | 'unread' | 'read' | 'bounced' | 'trash';
export type RecipientType = 'to' | 'bcc' | 'cc';
export type StorageProvider = 's3' | 'azure_blob';

export interface Recipient {
  id?: string;
  email_id?: string;
  recipient_email: string;
  recipient_name?: string;
  recipient_type: RecipientType;
  contact_id?: string;
  createdAt?: string;  // Backend uses camelCase
  updatedAt?: string;  // Backend uses camelCase
}

export interface Attachment {
  id?: string;
  email_id?: string;
  filename: string;
  file_size: number;
  mime_type: string;
  storage_url: string;
  storage_provider: StorageProvider;
  uploaded_at?: string;
}

// Nested conversation object returned within Email
export interface ConversationObject {
  id: string;
  user_id: string;
  subject: string;
  participant_emails: string; // JSON string, e.g. "[\"email@example.com\"]"
  last_message_at: string; // datetime
  message_count: number;
  created_at: string; // datetime
  updatedAt: string; // Backend uses camelCase
}

export interface Email {
  id: string;
  user_id: string;
  from_email: string;
  from_name: string;
  reply_to?: string;
  subject: string;
  conversation_id?: string;
  textcontent: string;
  html_content?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  priority: EmailPriority;
  status: EmailStatus;
  sent_at?: string;
  scheduled_for?: string;
  recipients?: Recipient[]; // Optional, will be populated on fetch
  attachments?: Attachment[]; // Optional, will be populated on fetch
  conversation?: ConversationObject; // Nested conversation from backend
}

export interface CreateEmailDto {
  from_email: string;
  from_name?: string;
  to_email?: string; // Direct recipient email (instead of using recipients for single TO)
  subject: string;
  textcontent: string;
  priority: EmailPriority;
  status: EmailStatus;
  recipients: {
    recipient_email: string;
    recipient_name?: string;
    recipient_type: RecipientType;
    contact_id?: string;
  }[];
  scheduled_for?: string;
  attachments?: {
    filename: string;
    file_size: number;
    mime_type: string;
    storage_url: string;
    storage_provider: StorageProvider;
  }[];
  conversation_id?: string;
}

export interface Contact {
  id: string;
  user_id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  tags: string[]; // Assuming tags can be multiple
  company: string;
  timezone: string;
  address: string;
}

// Grouped conversation data structure used by the frontend
export interface Conversation {
  id: string;
  user_id: string;
  subject: string;
  participant_emails: string; // JSON string from backend
  last_message_at: string; // datetime
  message_count: number;
  created_at: string; // datetime
  updatedAt: string; // Backend uses camelCase
  emails: Email[]; // Emails belonging to this conversation
}

// Helper function to parse participants from JSON string
export const parseParticipants = (participantEmails: string): string[] => {
  try {
    return JSON.parse(participantEmails);
  } catch {
    return [];
  }
};

