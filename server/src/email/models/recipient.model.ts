import { Model, Table, Column, PrimaryKey, DataType,  } from "sequelize-typescript";
import { RecipientType } from "../types/enums.types";

@Table({tableName:"email_recipients"})
export class Recipients extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    //foreignkey field
    @Column
    email_id: string;

    @Column
    recipient_email: string;

    @Column
    recipient_type: RecipientType;

    //foreignkey field
    @Column
    contact_id: string;
}