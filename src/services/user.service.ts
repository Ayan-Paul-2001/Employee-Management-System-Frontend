import api from '../lib/axios';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class UserService {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  async updateProfile(data: UpdateUserDto): Promise<User> {
    try {
      const response = await api.patch('/users/profile/update', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.patch('/users/profile/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }
}

export const userService = new UserService();