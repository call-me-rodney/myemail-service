import { Platform } from "./enums.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResponsePayload {
  userid: string;
  role: string;
  accessToken: string;
}

export interface Plaform {
  platform: Platform
}

export interface OTP {
  otp: string;
}