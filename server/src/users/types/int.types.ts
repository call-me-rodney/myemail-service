import { roles } from "./enum.types";

export interface VerificationRequest {
    userid: string;
    verified_by: string;
    role: roles;
}