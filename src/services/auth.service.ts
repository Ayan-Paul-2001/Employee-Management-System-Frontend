import api from '../lib/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  position?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
  success: boolean;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<any> {
    try {
      const response = await api.post('/auth/logout', {}, {
        withCredentials: true
      });
      this.clearUserData();
      return response.data;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterUserData): Promise<any> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await api.get('/auth/me', {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  setUserData(userData: any): void {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  getUserData(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  clearUserData(): void {
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    // We'll rely on the cookie being present, but we can't check directly
    // Instead, we'll use the user data as an indicator
    return !!this.getUserData();
  }
}

export const authService = new AuthService();