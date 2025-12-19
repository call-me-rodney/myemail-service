import { Model, Table, Column, PrimaryKey, DataType, BelongsTo, ForeignKey,  } from "sequelize-typescript";
import { Email } from "./email.model";
import { StorageProvider } from "../types/enums.types";

@Table({tableName:"email_attachments"})
export class Attachments extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    //foreignkey field
    @ForeignKey(() => Email)
    @Column
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

    @Column
    uploaded_at: Date;

    //associations
    @BelongsTo(() => Email,'email_id')
    email: Email;
}