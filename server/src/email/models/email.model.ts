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
  declare user_id: string;

  @Column
  declare from_email: string;

  @Column
  declare to_email: string;

  @Column
  declare subject: string;

  //foreign key to conversations table
  @ForeignKey(() => Conversations)
  @Column({type: DataType.UUID})
  declare conversation_id: string;

  @Column
  declare textcontent: string;

  @Column({defaultValue: "low"})
  declare priority: Priority;

  @Column({defaultValue: "draft"})
  declare status: Status;

  @CreatedAt
  @Column({defaultValue: new Date()})
  declare created_at: Date;

  @UpdatedAt
  @AllowNull
  @Column
  declare last_updated: Date;

  @Column({defaultValue: true})
  declare is_active: boolean;

  @DeletedAt
  @AllowNull
  @Column
  declare deactivated_at: Date;

  @AllowNull
  @Column
  declare sent_at: Date;

  @AllowNull
  @Column
  declare scheduled_for: Date;

  //associations
  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Conversations)
  declare conversation: Conversations;

  @HasMany(() => Recipients)
  declare recipients: Recipients[];

  @HasMany(() => Attachments)
  declare attachments: Attachments[];
}
