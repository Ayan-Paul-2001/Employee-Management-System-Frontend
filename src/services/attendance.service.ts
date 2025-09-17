import { BaseApiService } from './api';
import api from '../lib/axios';

export interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  notes?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  rejectionReason?: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  total: number;
  onLeave: number;
}

export class AttendanceService extends BaseApiService {
  constructor() {
    super('/attendance');
  }

  async getEmployeeAttendance(employeeId: number, month?: string, year?: string): Promise<Attendance[]> {
    // If employee ID is not provided, invalid, or NaN, return empty array
    if (!employeeId || isNaN(employeeId)) {
      return [];
    }
    
    try {
      const url = `${this.endpoint}/employee/${employeeId}${month && year ? `?month=${month}&year=${year}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      // Silently return empty array without logging error
      return [];
    }
  }
  
  async checkIn(employeeId: number, notes?: string): Promise<Attendance> {
    if (!employeeId) {
      console.error('Invalid employee ID for check-in');
      throw new Error('Employee ID is required for check-in');
    }
    
    try {
      const response = await api.post(`${this.endpoint}/check-in`, {
        employeeId,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }
  
  async checkOut(employeeId: number, notes?: string): Promise<Attendance> {
    if (!employeeId) {
      console.error('Invalid employee ID for check-out');
      throw new Error('Employee ID is required for check-out');
    }
    
    try {
      const response = await api.post(`${this.endpoint}/check-out`, {
        employeeId,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  }



  async getPendingAttendances(): Promise<Attendance[]> {
    try {
      // Using the correct endpoint /pending
      const response = await api.get(`${this.endpoint}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending attendances:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async approveAttendance(id: number, action: 'approve' | 'reject', approvedBy: number, rejectionReason?: string): Promise<Attendance> {
    try {
      const response = await api.patch(`${this.endpoint}/${id}/approve`, {
        action,
        approvedBy,
        rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Error approving attendance:', error);
      throw error;
    }
  }

  async getAttendanceStats(month: string, year: string): Promise<AttendanceStats> {
    try {
      const response = await api.get(`${this.endpoint}/stats?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      throw error;
    }
  }
}

export const attendanceService = new AttendanceService();