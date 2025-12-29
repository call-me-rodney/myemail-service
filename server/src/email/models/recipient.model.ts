import { Model, Table, Column, PrimaryKey, DataType, ForeignKey, BelongsTo, AllowNull } from "sequelize-typescript";
import { Email } from "./email.model";
import { Contact } from "src/contacts/models/contact.model";
import { RecipientType } from "../types/enums.types";

@Table({tableName:"email_recipients"})
export class Recipients extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    //foreignkey field
    @ForeignKey(() => Email)
    @Column({type: DataType.UUID})
    email_id: string;

    @Column
    recipient_email: string;

    @AllowNull
    @Column
    recipient_name: string;

    @Column
    recipient_type: RecipientType;

    //foreignkey field
    @AllowNull
    @ForeignKey(() => Contact)
    @Column({type: DataType.UUID})
    contact_id: string;

    //associations
    @BelongsTo(() => Email)
    email: Email;

    @BelongsTo(() => Contact)
    contact: Contact;
}