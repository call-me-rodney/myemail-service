import { IsString, IsEmail } from "@nestjs/class-validator";

export class CreateCompanyDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;
    
    @IsString()
    address: string;

    @IsString()
    service: string;
}
