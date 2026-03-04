// client/src/services/api.ts
import axios from 'axios';
import type { CreateEmailDto, AuthResponse, Email, CreateUserDTO } from '../types/interfaces';
import type { CompanyUser, VerificationRequestPayload } from '../types/interfaces';

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

export const sendBulkEmail = async (payload: { emailPayload: CreateEmailDto; mailingList: string[] }): Promise<Email> => {
  const response = await api.post<Email>('/email/bulk', payload);
  return response.data;
};

export interface CompanyData {
  id?: string;
  name: string;
  email?: string;
  address?: string;
  service?: string;
}

export const fetchCompanies = async (): Promise<CompanyData[]> => {
  const response = await api.get('/company');
  const data = response.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item: any) => {
      if (typeof item === 'string') {
        return { name: item } as CompanyData;
      }

      if (item && typeof item === 'object') {
        return {
          id: item.id,
          name: item.name || item.company || '',
          email: item.email,
          address: item.address,
          service: item.service,
        } as CompanyData;
      }

      return null;
    })
    .filter((item: CompanyData | null) => Boolean(item?.name));
};

// Mailing List API calls
export interface MailingListData {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  emails: string[];
  created_at?: string;
  updated_at?: string;
}

export const fetchMailingLists = async (): Promise<MailingListData[]> => {
  const response = await api.get<MailingListData[]>('/contacts/mailing-lists/user');
  return response.data;
};

export const createMailingList = async (data: { name: string; description?: string; emails: string[] }): Promise<MailingListData> => {
  const response = await api.post<MailingListData>('/contacts/mailing-lists', data);
  return response.data;
};

export const updateMailingList = async (id: string, data: { name?: string; description?: string; emails?: string[] }): Promise<MailingListData> => {
  const response = await api.patch<MailingListData>(`/contacts/mailing-lists/${id}`, data);
  return response.data;
};

export const deleteMailingList = async (id: string): Promise<void> => {
  await api.delete(`/contacts/mailing-lists/${id}`);
};

export const fetchUnverifiedUsersByCompany = async (company: string): Promise<CompanyUser[]> => {
  const response = await api.get<CompanyUser[] | string>(`/users/verify/${encodeURIComponent(company)}`);
  if (typeof response.data === 'string') {
    return [];
  }
  return response.data;
};

export const fetchUsers = async (): Promise<CompanyUser[]> => {
  const response = await api.get<CompanyUser[]>('/users');
  return response.data;
};

export const deactivateUser = async (id: string): Promise<string> => {
  const response = await api.patch<string>(`/users/deactivate/${id}`);
  return response.data;
};

export const verifyUser = async (payload: VerificationRequestPayload): Promise<string> => {
  const response = await api.patch<string>('/users/verify', payload);
  return response.data;
};

// Add other API calls as needed for contacts, analytics etc.
export default api;
