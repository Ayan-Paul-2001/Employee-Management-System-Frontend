'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse } from '../services/auth.service';

type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        // First check if we have user data in localStorage to prevent unnecessary API calls
        const storedUser = localStorage.getItem('user');
        
        // Check if we're on the login page
        const isLoginPage = window.location.pathname.includes('/login');
        
        if (storedUser) {
          // If we have stored user data, use it first to prevent loading state
          setUser(JSON.parse(storedUser));
          
          // Only validate with server if not on login page to prevent loops
          if (!isLoginPage) {
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
              // If server validation fails, clear user data
              console.error('Auth validation failed:', error);
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        } else if (!isLoginPage) {
          // No stored user and not on login page, try to get from API
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            // API call failed, but we're already handling this in the outer catch
            throw error;
          }
        } else {
          // On login page with no stored user, just set user to null
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear user data on error
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const { user } = response;
      
      // Store user in localStorage for UI purposes only
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      // Call the actual registration API
      const response = await authService.register(userData);
      console.log('Registration successful:', response);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data even if API call fails
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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