import { Table, Column, Model, PrimaryKey, DataType, AllowNull, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "src/users/models/user.model";

@Table({ tableName: 'mailing_lists' })
export class MailingList extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  user_id: string;

  @Column
  name: string;

  @Column({ type: DataType.TEXT })
  description: string;

  // Store emails as JSON array
  @Column({ type: DataType.JSONB, defaultValue: [] })
  emails: string[];

  @CreatedAt
  @Column({ defaultValue: new Date() })
  created_at: Date;

  @UpdatedAt
  @Column
  updated_at: Date;

  @DeletedAt
  @Column
  deleted_at: Date;

  @BelongsTo(() => User, 'user_id')
  user: User;
}
