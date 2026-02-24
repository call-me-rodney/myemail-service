import { IsDateString, IsString } from "@nestjs/class-validator";

export class CreateUserDto {
    @IsString()
    fname: string;

    @IsString()
    lname: string;
    
    @IsDateString()
    dob: Date;

    @IsString()
    company: string;

    @IsString()
    phone: string;

    @IsString()
    timezone: string;
}
