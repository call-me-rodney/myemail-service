import { Table, Column, Model, PrimaryKey, DataType, AllowNull, CreatedAt, DeletedAt, UpdatedAt } from "sequelize-typescript";
import { Tags } from "../types/enum.types";

@Table({ tableName: 'contacts' })
export class Contact extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  // foreign key field to users table
  @Column
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
}