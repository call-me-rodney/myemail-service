// client/src/types/interfaces.ts

export interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  dob: string; // Date string
  phone: string;
  password: string;
  timezone: string;
  role: 'user' | 'admin';
  daily_send_limit: number;
  created_at: string; // datetime
  lastLogin: string; // datetime
  created_by: string; // foreignkey to User
  is_active: boolean;
  is_verified: boolean;
  verified_at: string; // datetime
}

export interface AuthResponse {
  accessToken: string;
  user: User;
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
}

export interface CreateEmailDto {
  from_email: string;
  from_name: string;
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

export interface Conversation {
  id: string;
  user_id: string;
  subject: string;
  participants: string[]; // Assuming an array of participant identifiers (e.g., emails)
  last_message_at: string; // datetime
  message_count: number;
  created_at: string; // datetime
  emails: Email[]; // Emails belonging to this conversation
}

