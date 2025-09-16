'use client';

import { useState, useEffect } from 'react';
import { attendanceService, Attendance, AttendanceStats } from '../services/attendance.service';
import { EmployeeService } from '../services/employee.service';

export function useAttendance(userId?: number) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [pendingAttendances, setPendingAttendances] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<number | undefined>(undefined);
  const employeeService = new EmployeeService();
  
  // Get employee ID from user ID
  useEffect(() => {
    const getEmployeeId = async () => {
      if (userId) {
        try {
          const empId = await employeeService.getEmployeeIdByUserId(userId);
          setEmployeeId(empId);
        } catch (err) {
          console.error('Error getting employee ID:', err);
          setError('Could not find employee profile');
        }
      }
    };
    
    getEmployeeId();
  }, [userId]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAll();
      setAttendances(data);
    } catch (err) {
      setError('Failed to fetch attendances');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAttendance = async (userId: number, month?: string, year?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // If user ID is not provided or invalid, return empty array
      if (!userId) {
        setAttendances([]);
        return [];
      }
      
      // Use the employeeId from state that was fetched in useEffect
      if (!employeeId) {
        setAttendances([]);
        return [];
      }
      
      const data = await attendanceService.getEmployeeAttendance(employeeId, month, year);
      setAttendances(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch attendance`);
      // Return empty array instead of throwing error
      setAttendances([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (notes?: string) => {
    // If we don't have an employee ID but have a user ID, use a default employee ID of 1
    // This is a temporary fix to allow check-in without an employee profile
    const checkInEmployeeId = employeeId || 1;
    
    try {
      const newAttendance = await attendanceService.checkIn(checkInEmployeeId, notes);
      setAttendances(prev => [...prev, newAttendance]);
      setError(null);
      return newAttendance;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to check in';
      setError(errorMsg);
      console.error(errorMsg, err);
      throw err;
    }
  };

  const checkOut = async (notes?: string) => {
    // If we don't have an employee ID but have a user ID, use a default employee ID of 1
    // This is a temporary fix to allow check-out without an employee profile
    const checkOutEmployeeId = employeeId || 1;
    
    try {
      const updatedAttendance = await attendanceService.checkOut(checkOutEmployeeId, notes);
      setAttendances(prev => prev.map(att => 
        att.id === updatedAttendance.id ? updatedAttendance : att
      ));
      setError(null);
      return updatedAttendance;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to check out';
      setError(errorMsg);
      console.error(errorMsg, err);
      throw err;
    }
  };
  
  const fetchPendingAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getPendingAttendances();
      setPendingAttendances(data || []);
      return data;
    } catch (err) {
      console.error(err);
      setPendingAttendances([]);
      // Don't set error message to avoid showing error UI
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const approveAttendance = async (id: number, action: 'approve' | 'reject', approvedBy: number, rejectionReason?: string) => {
    try {
      await attendanceService.approveAttendance(id, action, approvedBy, rejectionReason);
      fetchPendingAttendances();
    } catch (err) {
      setError(`Failed to ${action} attendance`);
      console.error(err);
      throw err;
    }
  };

  const fetchAttendanceStats = async (month: string, year: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAttendanceStats(month, year);
      setStats(data);
      return data;
    } catch (err) {
      setError('Failed to fetch attendance statistics');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeAttendance(employeeId);
    } else {
      fetchAttendances();
    }
  }, [employeeId]);

  return {
    attendances,
    pendingAttendances,
    stats,
    loading,
    error,
    fetchAttendances,
    fetchEmployeeAttendance,
    checkIn,
    checkOut,
    fetchPendingAttendances,
    approveAttendance,
    fetchAttendanceStats,
  };
}