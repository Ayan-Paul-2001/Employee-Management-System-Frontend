'use client';

import { useState, useEffect } from 'react';
import { noticeService, Notice } from '../services/notice.service';

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noticeService.getAll();
      setNotices(data);
    } catch (err) {
      setError('Failed to fetch notices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noticeService.getActiveNotices();
      setNotices(data);
      return data;
    } catch (err) {
      setError('Failed to fetch active notices');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createNotice = async (noticeData: Omit<Notice, 'id' | 'publishedBy' | 'publishedAt' | 'isActive' | 'createdAt' | 'updatedAt'> & { createdById?: number }) => {
    try {
      // Make sure we're sending the correct fields to the backend
      const payload = {
        title: noticeData.title,
        body: noticeData.body,
        expiresAt: noticeData.expiresAt || null,
        createdById: noticeData.createdById // Use the createdById passed from the component
      };
      
      const newNotice = await noticeService.create(payload);
      setNotices([...notices, newNotice]);
      return newNotice;
    } catch (err) {
      setError('Failed to create notice');
      console.error(err);
      throw err;
    }
  };

  const updateNotice = async (id: number, noticeData: Partial<Notice>) => {
    try {
      const updatedNotice = await noticeService.update(id, noticeData);
      setNotices(notices.map(notice => notice.id === id ? updatedNotice : notice));
      return updatedNotice;
    } catch (err) {
      setError(`Failed to update notice ${id}`);
      console.error(err);
      throw err;
    }
  };

  const publishNotice = async (id: number) => {
    try {
      const updatedNotice = await noticeService.publishNotice(id);
      setNotices(notices.map(notice => notice.id === id ? updatedNotice : notice));
      return updatedNotice;
    } catch (err) {
      setError(`Failed to publish notice ${id}`);
      console.error(err);
      throw err;
    }
  };

  const unpublishNotice = async (id: number) => {
    try {
      const updatedNotice = await noticeService.unpublishNotice(id);
      setNotices(notices.map(notice => notice.id === id ? updatedNotice : notice));
      return updatedNotice;
    } catch (err) {
      setError(`Failed to unpublish notice ${id}`);
      console.error(err);
      throw err;
    }
  };

  const deleteNotice = async (id: number) => {
    try {
      await noticeService.delete(id);
      setNotices(notices.filter(notice => notice.id !== id));
    } catch (err) {
      setError(`Failed to delete notice ${id}`);
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return {
    notices,
    loading,
    error,
    fetchNotices,
    fetchActiveNotices,
    createNotice,
    updateNotice,
    publishNotice,
    unpublishNotice,
    deleteNotice
  };
}