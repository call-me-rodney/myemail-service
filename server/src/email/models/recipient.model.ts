import { Model, Table, Column, PrimaryKey, DataType, ForeignKey, HasOne,  } from "sequelize-typescript";
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
    @Column
    email_id: string;

    @Column
    recipient_email: string;

    @Column
    recipient_type: RecipientType;

    //foreignkey field
    @ForeignKey(() => Contact)
    @Column
    contact_id: string;

    //associations
    @HasOne(() => Email,'email_id')
    email: Email;

    @HasOne(() => Contact,'contact_id')
    contact: Contact;
}