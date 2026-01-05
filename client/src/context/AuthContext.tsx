// client/src/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types/interfaces';
import * as api from '../services/api';
import socketService from '../services/socket';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (credentials: Pick<User, 'email' | 'password'>) => Promise<void>;
  register: (userData: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Define logout first so it can be used in useEffect
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    socketService.disconnect();
  }, []); // useCallback to memoize the function

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setAccessToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          socketService.connect(storedToken);
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
          logout();
        }
      }
    };
    initializeAuth();

    return () => {
      socketService.disconnect();
    };
  }, [logout]); // Add logout to dependency array

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);
    socketService.connect(data.accessToken);
  }, []); // useCallback to memoize the function

  const loginUser = useCallback(async (credentials: Pick<User, 'email' | 'password'>) => {
    const data = await api.login(credentials);
    handleAuthResponse(data);
  }, [handleAuthResponse]); // Add handleAuthResponse to dependency array

  const registerUser = useCallback(async (userData: User) => {
    const data = await api.register(userData);
    handleAuthResponse(data);
  }, [handleAuthResponse]); // Add handleAuthResponse to dependency array



  return (
    <AuthContext.Provider value={{ user, accessToken, login: loginUser, register: registerUser, logout, isAuthenticated }}>
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
