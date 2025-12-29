import { Model, Table, Column, PrimaryKey, DataType, BelongsTo, ForeignKey, CreatedAt } from "sequelize-typescript";
import { Email } from "./email.model";
import { StorageProvider } from "../types/enums.types";

@Table({tableName:"email_attachments"})
export class Attachments extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    //foreignkey field
    @ForeignKey(() => Email)
    @Column({type: DataType.UUID})
    email_id: string;

    @Column
    filename: string;

    @Column
    file_size: number;

    @Column
    mime_type: string;

    @Column
    storage_url: string;

    @Column
    storage_provider: StorageProvider;

    @CreatedAt
    @Column
    uploaded_at: Date;

    //associations
    @BelongsTo(() => Email)
    email: Email;
}