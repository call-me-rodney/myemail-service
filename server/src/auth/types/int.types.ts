export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResponsePayload {
  userid: string;
  role: string;
  accessToken: string;
  email: string;
  name: string; // Full name: fname lname
}

export interface OTP {
  otp: string;
}