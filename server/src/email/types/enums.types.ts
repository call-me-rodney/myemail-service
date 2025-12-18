export enum Priority {
    Low = "low",
    Normal = "normal",
    High = "high"
}

export enum Status {
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

export enum StorageProvider {
    S3 = "s3",
    GCS = "gcs",
    Azure = "azure",
    Local = "local"
}

export enum RecipientType {
    To = "to",
    Cc = "cc",
    Bcc = "bcc"
}