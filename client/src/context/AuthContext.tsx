// client/src/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, CreateUserDTO } from '../types/interfaces';
import * as api from '../services/api';
import socketService from '../services/socket';

interface AuthContextType {
  userid: string | null;
  role: 'user' | 'admin' | null;
  accessToken: string | null;
  email: string | null;
  name: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: CreateUserDTO) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userid, setUserid] = useState<string | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Define logout first so it can be used in useEffect
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userid');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    setAccessToken(null);
    setUserid(null);
    setRole(null);
    setEmail(null);
    setName(null);
    setIsAuthenticated(false);
    socketService.disconnect();
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUserid = localStorage.getItem('userid');
      const storedRole = localStorage.getItem('role');
      const storedEmail = localStorage.getItem('email');
      const storedName = localStorage.getItem('name');
      
      if (storedToken && storedUserid && storedRole) {
        setAccessToken(storedToken);
        setUserid(storedUserid);
        setRole(storedRole as 'user' | 'admin');
        if (storedEmail) setEmail(storedEmail);
        if (storedName) setName(storedName);
        setIsAuthenticated(true);
        socketService.connect(storedToken);
      }
    };
    initializeAuth();

    return () => {
      socketService.disconnect();
    };
  }, [logout]); // Add logout to dependency array

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('userid', data.userid);
    localStorage.setItem('role', data.role);
    localStorage.setItem('email', data.email);
    localStorage.setItem('name', data.name);
    setAccessToken(data.accessToken);
    setUserid(data.userid);
    setRole(data.role);
    setEmail(data.email);
    setName(data.name);
    setIsAuthenticated(true);
    socketService.connect(data.accessToken);
  }, []);

  const loginUser = useCallback(async (credentials: { email: string; password: string }) => {
    const data = await api.login(credentials);
    handleAuthResponse(data);
  }, [handleAuthResponse]);

  const registerUser = useCallback(async (userData: CreateUserDTO) => {
    const data = await api.register(userData);
    handleAuthResponse(data);
  }, [handleAuthResponse]);



  return (
    <AuthContext.Provider value={{ userid, role, accessToken, email, name, login: loginUser, register: registerUser, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
