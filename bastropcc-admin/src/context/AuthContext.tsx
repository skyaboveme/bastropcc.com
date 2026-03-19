import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setAuthToken } from '../api/client';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await apiClient.get('/auth/me') as any;
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Restore token from localStorage synchronously on init
  const [hasInitToken, setHasInitToken] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setAuthToken(token);
    setHasInitToken(true);
  }, []);

  useEffect(() => {
    if (hasInitToken) {
      checkAuth();
    }

    // Listen to unauthorized event from axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [hasInitToken]);

  const login = (token: string, user: User) => {
    setAuthToken(token);
    setUser(user);
    localStorage.setItem('access_token', token);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch(e) {}
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
