import { Model, Table, Column, PrimaryKey, DataType, ForeignKey, HasMany, HasOne} from "sequelize-typescript";
import { User } from "src/users/models/user.model";
import { Email } from "./email.model";

@Table({tableName:"email_conversations"})
export class Conversations extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    //foreign key to user table
    @ForeignKey(() => User)
    @Column
    user_id: string;

    @Column
    subject: string;

    @ForeignKey(() => Email)
    @Column
    participant_emails: string;

    @Column({defaultValue: new Date()})
    last_message_at: Date;

    @Column
    message_count: number;

    @Column
    created_at: Date;

    //associations
    @HasOne(() => User, 'user_id')
    user: User;
    
    @HasMany(() => Email, 'conversation_id')
    emails: Email[];
}