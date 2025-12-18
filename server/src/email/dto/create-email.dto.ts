import { IsEmail, IsUUID } from "@nestjs/class-validator";
import { Priority, Status } from "../types/enums.types";

export class CreateEmailDto {
  @IsUUID("4")
  user_id: string;

  @IsEmail()
  from_email: string;

  from_name: string;

  @IsEmail()
  to_email: string;

  subject: string;

  @IsUUID("4")
  conversation_id: string;

  textcontent: string;
  htmlcontent: string;
  priority: Priority;
  status: Status;
  created_at: Date;
}