import { IsDateString, IsEmail, IsString, IsEnum } from "@nestjs/class-validator";
import { Roles } from "../types/enum.types"

export class CreateUserDto {
    @IsString()
    fname: string;

    @IsString()
    lname: string;

    @IsEmail()
    @IsString()
    email: string;
    
    @IsDateString()
    dob: Date;

    @IsString()
    password: string;

    @IsString()
    phone: string;

    @IsString()
    timezone: string;

    @IsEnum(Roles)
    @IsString()
    role: Roles;

    @IsString()
    created_by: string;
}
