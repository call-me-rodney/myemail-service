import { IsUUID, IsString, IsArray, IsEmail, IsOptional } from "@nestjs/class-validator";

export class CreateMailingListDto {
  @IsUUID('4')
  user_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}
