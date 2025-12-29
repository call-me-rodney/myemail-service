import { Column, Model, Table, PrimaryKey, CreatedAt, UpdatedAt, DeletedAt, AllowNull, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { User } from 'src/users/models/user.model';
import { Conversations } from './conversation.model';
import { Recipients } from './recipient.model';
import { Attachments } from './attachment.model';
import { Priority, Status } from '../types/enums.types';


@Table({tableName: 'emails'})
export class Email extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  //foreign key to users table
  @ForeignKey(() => User)
  @Column({type: DataType.UUID})
  user_id: string;

  @Column
  from_email: string;

  @Column
  from_name: string;

  @Column
  to_email: string;

  @Column
  subject: string;

  //foreign key to conversations table
  @ForeignKey(() => Conversations)
  @Column({type: DataType.UUID})
  conversation_id: string;

  @Column
  textcontent: string;

  @Column({defaultValue: "low"})
  priority: Priority;

  @Column({defaultValue: "draft"})
  status: Status;

  @CreatedAt
  @Column({defaultValue: new Date()})
  created_at: Date;

  @UpdatedAt
  @AllowNull
  @Column
  updated_at: Date;

  @DeletedAt
  @AllowNull
  @Column
  deleted_at: Date;

  @AllowNull
  @Column
  sent_at: Date;

  @AllowNull
  @Column
  scheduled_for: Date;

  //associations
  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Conversations)
  conversation: Conversations;

  @HasMany(() => Recipients)
  recipients: Recipients[];

  @HasMany(() => Attachments)
  attachments: Attachments[];
}
