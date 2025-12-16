import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailDto } from './create-emails.dto';

import { IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { Priority } from '../email.model.ts/priority.enum';
import { Status } from '../email.model.ts/status.enum';

export class UpdateEmailDto extends PartialType(CreateEmailDto) {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsEmail()
  recipient?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}