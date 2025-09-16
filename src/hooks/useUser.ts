'use client';

import { useState, useCallback } from 'react';
import { userService, User, UpdateUserDto } from '../services/user.service';
import { useAuth } from '@/lib/auth-context';

export function useUser() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: UpdateUserDto) => {
    if (!authUser?.id) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await userService.updateProfile(data);
      return updatedUser;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!authUser?.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await userService.changePassword(currentPassword, newPassword);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
      return false;
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  return {
    updateProfile,
    changePassword,
    loading,
    error,
  };
}