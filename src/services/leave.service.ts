import { BaseApiService } from './api';
import api from '../lib/axios';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  fromDate: string;
  toDate: string;
  type?: 'ANNUAL' | 'SICK' | 'PERSONAL' | 'UNPAID' | 'OTHER';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId?: number;
  employeeName?: string; // Added for admin view
  createdAt: string;
  updatedAt: string;
}

export class LeaveService extends BaseApiService {
  constructor() {
    super('/leave');
  }

  async getEmployeeLeaves(employeeId: number | string): Promise<LeaveRequest[]> {
    try {
      // Ensure employeeId is a number when passed to the API
      const id = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;
      const response = await api.get(`${this.endpoint}/employee/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leaves for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async approveLeave(leaveId: number): Promise<LeaveRequest> {
    try {
      const response = await api.patch(`${this.endpoint}/${leaveId}/approve`);
      return response.data;
    } catch (error) {
      console.error(`Error approving leave ${leaveId}:`, error);
      throw error;
    }
  }

  async rejectLeave(leaveId: number, reason?: string): Promise<LeaveRequest> {
    try {
      const response = await api.patch(`${this.endpoint}/${leaveId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting leave ${leaveId}:`, error);
      throw error;
    }
  }

  async getPendingLeaves(): Promise<LeaveRequest[]> {
    try {
      const response = await api.get(`${this.endpoint}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
      throw error;
    }
  }

  async getLeaveBalance(employeeId: string | number): Promise<any> {
    try {
      const response = await api.get(`${this.endpoint}/balance/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leave balance for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async create(leaveData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    try {
      const response = await api.post(this.endpoint, leaveData);
      return response.data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  }
}

export const leaveService = new LeaveService();