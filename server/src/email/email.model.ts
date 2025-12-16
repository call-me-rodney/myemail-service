
import type { UUID } from 'crypto';
import { Column, Model, Table } from 'sequelize-typescript';

enum Priority {
    Low = "low",
    Normal = "normal",
    High = "high"
}

enum Status {
    Draft = "draft",
    Scheduled = "scheduled",
    Queued = "queued",
    Sent = "sent",
    Failed = "failed",
    Pending = "pending",
    Unread = "unread",
    Read = "read",
    Bounced = "bounced",
    Trash = "trash"
}

@Table
export class Email extends Model {
  @Column
  declare id: UUID;

  @Column
  user_id: string;

  @Column
  from_email: Email;

  @Column
  from_name: string;

  @Column
  to_email: Email;

  @Column
  subject: string;

  @Column
  conversation_id: string;

  @Column
  textcontent: string;

  @Column
  htmlcontent: string;

  @Column({defaultValue: "low"})
  priority: Priority;

  @Column({defaultValue: "draft"})
  status: Status;

  @Column({defaultValue: new Date()})
  created_at: Date;

  @Column
  updated_at: Date;

  @Column
  deleted_at: Date;

  @Column
  sent_at: Date;

  @Column
  scheduled_for: Date;

  @Column({ defaultValue: true })
  isActive: boolean;
}
