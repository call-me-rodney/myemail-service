import { IsDateString, IsEmail, IsEnum, isString, IsString } from "@nestjs/class-validator";

export class CreateUserDto {
    @IsString()
    declare fname: string;

    @IsString()
    declare lname: string;

    @IsEmail()
    declare email: string;

    @IsString()
    declare password: string;

    @IsString()
    declare company: string;

    @IsDateString()
    declare dob: Date;

    @IsString()
    declare timezone: string;
}
