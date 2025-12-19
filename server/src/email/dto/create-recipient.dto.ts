import { IsEmail, IsEnum, IsOptional, IsUUID } from '@nestjs/class-validator';
import { RecipientType } from '../types/enums.types';

export class CreateRecipientDto {
  @IsEmail()
  recipient_email: string;

  @IsOptional()
  recipient_name?: string;

  @IsEnum(RecipientType)
  recipient_type: RecipientType;

  @IsOptional()
  @IsUUID('4')
  contact_id?: string;
}
