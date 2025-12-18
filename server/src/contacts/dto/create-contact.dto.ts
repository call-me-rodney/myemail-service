import { IsEmail, IsUUID } from "@nestjs/class-validator";
import { Tags } from "../types/enum.types";
export class CreateContactDto {
    @IsUUID('4')
    user_id: string;

    fname: string;
    lname: string;

    @IsEmail()
    email: string;

    phone: string;
    tags: Tags;
    company: string;
    timezone: string;
    address: string;
}
