'use client';

import { useState, useEffect } from 'react';
import { leaveService, LeaveRequest } from '../services/leave.service';

export function useLeaves(employeeId?: string | number) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveService.getAll();
      setLeaves(data);
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeLeaves = async (empId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      // Ensure employeeId is a number
      const id = typeof empId === 'string' ? parseInt(empId, 10) : empId;
      const data = await leaveService.getEmployeeLeaves(id);
      setLeaves(data);
      return data;
    } catch (err) {
      setError(`Failed to fetch leaves for employee ${empId}`);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveService.getPendingLeaves();
      setLeaves(data);
      return data;
    } catch (err) {
      setError('Failed to fetch pending leave requests');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createLeaveRequest = async (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLeave = await leaveService.create(leaveData);
      setLeaves([...leaves, newLeave]);
      return newLeave;
    } catch (err) {
      setError('Failed to create leave request');
      console.error(err);
      throw err;
    }
  };

  const approveLeave = async (leaveId: number) => {
    try {
      const updatedLeave = await leaveService.approveLeave(leaveId);
      setLeaves(leaves.map(leave => leave.id === leaveId ? updatedLeave : leave));
      return updatedLeave;
    } catch (err) {
      setError(`Failed to approve leave request ${leaveId}`);
      console.error(err);
      throw err;
    }
  };

  const rejectLeave = async (leaveId: number, reason?: string) => {
    try {
      const updatedLeave = await leaveService.rejectLeave(leaveId, reason);
      setLeaves(leaves.map(leave => leave.id === leaveId ? updatedLeave : leave));
      return updatedLeave;
    } catch (err) {
      setError(`Failed to reject leave request ${leaveId}`);
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    if (employeeId) {
      // Ensure employeeId is a number when passed to fetchEmployeeLeaves
      const id = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;
      fetchEmployeeLeaves(id);
    } else {
      fetchLeaves();
    }
  }, [employeeId]);

  return {
    leaves,
    loading,
    error,
    fetchLeaves,
    fetchEmployeeLeaves,
    fetchPendingLeaves,
    createLeaveRequest,
    approveLeave,
    rejectLeave
  };
}