export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResponsePayload {
  userid: string;
  role: string;
  accessToken: string;
}