import { Table, Column, Model, PrimaryKey, DataType, AllowNull, CreatedAt, DeletedAt, UpdatedAt, BelongsTo, ForeignKey } from "sequelize-typescript";
import { User } from "src/users/models/user.model";
import { Tags } from "../types/enum.types";

@Table({ tableName: 'contacts' })
export class Contact extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  // foreign key field to users table
  @ForeignKey(() => User)
  @Column({type: DataType.UUID})
  user_id: string;

  @Column
  fname: string;

  @Column
  lname: string;

  @Column
  email: string;

  @AllowNull
  @Column
  phone: string;

  @AllowNull
  @Column({defaultValue: Tags.client})
  tags: Tags;

  @AllowNull
  @Column
  company: string;

  @Column
  timezone: string;

  @AllowNull
  @Column
  address: string;

  @CreatedAt
  @Column({defaultValue: new Date()})
  created_at: Date;

  @UpdatedAt
  @Column
  updated_at: Date;

  @DeletedAt
  @Column
  deleted_at: Date;

  // associations
  @BelongsTo(() => User,'user_id')
  user: User;
}