import { Model, Table, Column, PrimaryKey, DataType,  } from "sequelize-typescript";

@Table({tableName:"email_conversations"})
export class Conversations extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    //foreign key to user table
    @Column
    user_id: string;

    @Column
    subject: string;

    @Column
    participant_emails: string; // Comma-separated emails

    @Column({defaultValue: new Date()})
    last_message_at: Date;

    @Column
    message_count: number;

    @Column
    created_at: Date;
}