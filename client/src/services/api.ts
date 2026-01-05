// client/src/services/api.ts
import axios from 'axios';
import type { CreateEmailDto, AuthResponse, Email, User } from '../types/interfaces';

const API_BASE_URL = 'http://localhost:3000'; // Assuming backend runs on port 3000

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const login = async (credentials: Pick<User, 'email' | 'password'>): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const register = async (userData: User): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', userData);
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const fetchEmails = async (): Promise<Email[]> => {
  const response = await api.get<Email[]>('/email/user');
  return response.data;
};

export const sendEmail = async (emailData: CreateEmailDto): Promise<Email> => {
  const response = await api.post<Email>('/email', emailData);
  return response.data;
};

// Add other API calls as needed for contacts, analytics etc.
export default api;
