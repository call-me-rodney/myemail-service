// client/src/services/api.ts
import axios from 'axios';
import type { CreateEmailDto, AuthResponse, Email, CreateUserDTO } from '../types/interfaces';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

export const login = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  const data = response.data;
  
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  
  throw new Error('Login failed');
};

export const register = async (userData: CreateUserDTO): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', userData);
  const data = response.data;
  
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  
  throw new Error('Registration failed');
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
