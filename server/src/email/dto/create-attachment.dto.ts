import { IsEnum, IsInt, IsString, IsUrl, IsDateString, IsOptional } from '@nestjs/class-validator';
import { StorageProvider } from '../types/enums.types';

export class CreateAttachmentDto {
  @IsString()
  filename: string;

  @IsInt()
  file_size: number;

  @IsString()
  mime_type: string;

  @IsUrl()
  storage_url: string;

  @IsEnum(StorageProvider)
  storage_provider: StorageProvider;

  @IsOptional()
  @IsDateString()
  uploaded_at?: Date;
}
