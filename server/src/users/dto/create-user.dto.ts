import { IsEmail } from "@nestjs/class-validator";
import { Roles } from "../types/enum.types"
export class CreateUserDto {
    fname: string;
    lname: string;

    @IsEmail()
    email: string;
    
    dob: Date;
    password: string;
    phone: string;
    timezone: string;
    role: Roles;
    created_by: string;
}
