import { BaseApiService } from './api';
import api from '../lib/axios';

export interface Notice {
  id: number;
  title: string;
  body: string;
  publishedBy: number;
  publishedAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class NoticeService extends BaseApiService {
  constructor() {
    super('/notices');
  }
  
  async create(data: any): Promise<Notice> {
    try {
      // Send the data directly without modification
      // This ensures all fields including createdById are passed correctly
      const response = await api.post(this.endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  async getActiveNotices(): Promise<Notice[]> {
    try {
      const response = await api.get(`${this.endpoint}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active notices:', error);
      throw error;
    }
  }

  async publishNotice(noticeId: number): Promise<Notice> {
    try {
      const response = await api.patch(`${this.endpoint}/${noticeId}/publish`);
      return response.data;
    } catch (error) {
      console.error(`Error publishing notice ${noticeId}:`, error);
      throw error;
    }
  }

  async unpublishNotice(noticeId: number): Promise<Notice> {
    try {
      const response = await api.patch(`${this.endpoint}/${noticeId}/unpublish`);
      return response.data;
    } catch (error) {
      console.error(`Error unpublishing notice ${noticeId}:`, error);
      throw error;
    }
  }
}

export const noticeService = new NoticeService();