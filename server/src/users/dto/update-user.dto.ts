import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsString } from '@nestjs/class-validator';
import { roles } from '../types/enum.types';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @IsEnum(roles)
    declare role: string;
}
