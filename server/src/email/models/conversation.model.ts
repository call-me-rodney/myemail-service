import { Model, Table, Column, PrimaryKey, DataType, ForeignKey, HasMany, BelongsTo, CreatedAt } from "sequelize-typescript";
import { User } from "src/users/models/user.model";
import { Email } from "./email.model";

@Table({tableName:"email_conversations"})
export class Conversations extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    //foreign key to user table
    @ForeignKey(() => User)
    @Column({type: DataType.UUID})
    user_id: string;

    @Column
    subject: string;

    @Column({type: DataType.JSONB})
    participant_emails: string;

    @Column({defaultValue: new Date()})
    last_message_at: Date;

    @Column({defaultValue: 0})
    message_count: number;

    @CreatedAt
    @Column
    created_at: Date;

    //associations
    @BelongsTo(() => User)
    user: User;
    
    @HasMany(() => Email)
    emails: Email[];
}