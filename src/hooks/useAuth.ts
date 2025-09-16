import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({email, password});
      setUser(response.user);
      setError(null);
      return response.user;
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      authService.removeToken();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    checkAuth,
  };
};