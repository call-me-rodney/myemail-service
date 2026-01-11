import { IsEmail, IsUUID, IsOptional, IsEnum, IsArray, ValidateNested, IsString, IsDateString } from "@nestjs/class-validator";
import { Type } from 'class-transformer';
import { Priority, Status } from "../types/enums.types";
import { CreateRecipientDto } from "./create-recipient.dto";
import { CreateAttachmentDto } from "./create-attachment.dto";

export class CreateEmailDto {
  @IsUUID("4")
  user_id: string;

  @IsEmail()
  from_email: string;

  @IsOptional()
  @IsString()
  from_name: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsUUID("4")
  conversation_id?: string;

  @IsString()
  textcontent: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsDateString()
  scheduled_for?: Date;

  // Nested recipients (to, cc, bcc)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipientDto)
  recipients: CreateRecipientDto[];

  // Optional attachments
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}