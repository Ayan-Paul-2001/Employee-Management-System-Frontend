'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLeaves } from '@/hooks/useLeaves';
import { LeaveRequest } from '@/services/leave.service';
import { EmployeeService } from '@/services/employee.service';
import { z } from 'zod';

type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'UNPAID' | 'OTHER';

export default function LeavesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [formData, setFormData] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reason: '',
    type: 'ANNUAL' as LeaveType,
    employeeId: 0
  });
  
  // State for error messages
  const [formError, setFormError] = useState<string | null>(null);
  
  // Import employee service
  const employeeService = new EmployeeService();
  
  // Get employee ID from user ID
  useEffect(() => {
    const getEmployeeId = async () => {
      if (user?.id) {
        try {
          const empId = await employeeService.getEmployeeIdByUserId(user.id);
          setEmployeeId(empId);
          setFormData(prev => ({ ...prev, employeeId: empId }));
        } catch (err) {
          console.error('Error getting employee ID:', err);
          // Use default employee ID 1 as fallback
          const defaultEmpId = 1;
          setEmployeeId(defaultEmpId);
          setFormData(prev => ({ ...prev, employeeId: defaultEmpId }));
        }
      } else {
        // Default to employee ID 1 if no user ID
        setEmployeeId(1);
        setFormData(prev => ({ ...prev, employeeId: 1 }));
      }
    };
    
    getEmployeeId();
  }, [user?.id]);
  
  const { 
    leaves, 
    loading, 
    error, 
    fetchLeaves, 
    fetchEmployeeLeaves,
    fetchPendingLeaves,
    createLeaveRequest,
    approveLeave,
    rejectLeave
  } = useLeaves(user?.id);

  const handleStatusChange = async (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      if (newStatus === 'APPROVED') {
        await approveLeave(id);
      } else {
        await rejectLeave(id);
      }
      
      // Refresh the list after approval/rejection
      if (isAdmin) {
        await fetchPendingLeaves();
      } else if (user?.id) {
        await fetchEmployeeLeaves(user.id.toString());
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Define leave request schema with Zod
  const leaveRequestSchema = z.object({
    fromDate: z.string().refine(date => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Start date cannot be in the past"
    }),
    toDate: z.string().refine(date => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "End date cannot be in the past"
    }),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
    type: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID', 'OTHER']),
    employeeId: z.number().positive()
  }).refine(data => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "End date must be after or equal to start date",
    path: ["toDate"]
  });

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure we have a valid employee ID (use the current employeeId state)
      const leaveRequestData = {
        ...formData,
        type: formData.type as LeaveType,
        employeeId: employeeId || 1 // Use the employeeId state or default to 1
      };
      
      // Validate with Zod
      const validatedData = leaveRequestSchema.parse(leaveRequestData);
      
      console.log('Submitting leave request with data:', validatedData);
      await createLeaveRequest(validatedData);
      setShowLeaveForm(false);
      
      // Reset form
      setFormData({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        reason: '',
        type: 'ANNUAL' as LeaveType,
        employeeId: employeeId || 1
      });
      
      // Clear any previous errors
      setFormError(null);
      
      // Refresh leaves
      if (user?.id) {
        await fetchEmployeeLeaves(user.id.toString());
      }
    } catch (err: any) {
      console.error('Error creating leave request:', err);
      if (err instanceof z.ZodError && err.issues && Array.isArray(err. issues)) {
        setFormError(err.issues.map(e => e.message).join(', '));
      } else {
        setFormError('Failed to create leave request: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      }
    }
  };

  const getStatusBadgeClass = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={() => setShowLeaveForm(!showLeaveForm)}
        >
          {showLeaveForm ? 'Cancel' : 'Request Leave'}
        </button>
      </div>
      
      {showLeaveForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Leave Request</h2>
          <form onSubmit={handleSubmitLeave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
      
      {(error || formError) && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error || formError}
          <button 
            className="ml-2 underline" 
            onClick={() => {
              if (formError) setFormError(null);
              isAdmin ? fetchPendingLeaves() : (user?.id ? fetchEmployeeLeaves(user.id) : null);
            }}
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white shadow p-6 text-center rounded-md">
          No leave requests found.
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {isAdmin && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Employee
                        </th>
                      )}

                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Period
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      {isAdmin && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaves.map((request) => (
                      <tr key={request.id}>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                          </td>
                        )}

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.fromDate === request.toDate
                              ? request.fromDate
                              : `${request.fromDate} to ${request.toDate}`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{request.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        {isAdmin && request.status === 'PENDING' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleStatusChange(request.id, 'APPROVED')}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </td>
                        )}
                        {isAdmin && request.status !== 'PENDING' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className="text-gray-500">No actions available</span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}