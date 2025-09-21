'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuth } from '@/lib/auth-context';
import { Attendance } from '@/services/attendance.service';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

type AttendanceRecord = Attendance & {
  employeeName?: string;
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  
  const { 
    attendances, 
    loading, 
    error, 
    checkIn, 
    checkOut, 
    fetchAttendances,
    fetchEmployeeAttendance
  } = useAttendance(user?.id);

  useEffect(() => {
    if (user?.id) {
      fetchEmployeeAttendance(user.id, selectedDate.split('-')[1], selectedDate.split('-')[0]);
    }
  }, [user, selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    if (user?.id) {
      fetchEmployeeAttendance(user.id, e.target.value.split('-')[1], e.target.value.split('-')[0]);
    }
  };
  
  const openCheckInDialog = () => {
    setNotes('');
    setIsCheckInDialogOpen(true);
  };

  const openCheckOutDialog = () => {
    setNotes('');
    setIsCheckOutDialogOpen(true);
  };
  
  // Define check-in schema with Zod
  const checkInSchema = z.object({
    notes: z.string().optional(),
    userId: z.number({
      required_error: "User ID is required for check-in",
      invalid_type_error: "User ID must be a number"
    })
  });

  const handleCheckIn = async () => {
    if (!user?.id) {
      toast.error('User ID is required for check-in');
      setIsCheckInDialogOpen(false);
      return;
    }
    
    try {
      // Validate with Zod
      const validatedData = checkInSchema.parse({
        notes,
        userId: user.id
      });
      
      await checkIn(validatedData.notes);
      setIsCheckInDialogOpen(false);
      fetchEmployeeAttendance(user.id, selectedDate.split('-')[1], selectedDate.split('-')[0]);
      toast.success('Checked in successfully');
    } catch (err: any) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        console.error('Error checking in:', err);
        const errorMessage = err.response?.data?.message || 'Failed to check in';
        toast.error(errorMessage);
      }
      setIsCheckInDialogOpen(false);
    }
  };
  
  // Define check-out schema with Zod
  const checkOutSchema = z.object({
    notes: z.string().optional(),
    userId: z.number({
      required_error: "User ID is required for check-out",
      invalid_type_error: "User ID must be a number"
    })
  });

  const handleCheckOut = async () => {
    if (!user?.id) {
      toast.error('User ID is required for check-out');
      setIsCheckOutDialogOpen(false);
      return;
    }
    
    try {
      // Validate with Zod
      const validatedData = checkOutSchema.parse({
        notes,
        userId: user.id
      });
      
      await checkOut(validatedData.notes);
      setIsCheckOutDialogOpen(false);
      fetchEmployeeAttendance(user.id, selectedDate.split('-')[1], selectedDate.split('-')[0]);
      toast.success('Checked out successfully');
    } catch (err: any) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        console.error('Error checking out:', err);
        const errorMessage = err.response?.data?.message || 'Failed to check out';
        toast.error(errorMessage);
      }
      setIsCheckOutDialogOpen(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'HALF_DAY':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getApprovalBadgeClass = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Check if user has already checked in today
  const hasCheckedInToday = attendances.some(
    att => new Date(att.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && att.checkInTime
  );
  
  // Check if user has already checked out today
  const hasCheckedOutToday = attendances.some(
    att => new Date(att.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && att.checkOutTime
  );
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <label htmlFor="date" className="mr-2">Select Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded p-2"
          />
        </div>
        
        <div className="space-x-2">
          <Button 
            onClick={openCheckInDialog} 
            disabled={hasCheckedInToday || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Check In
          </Button>
          <Button 
            onClick={openCheckOutDialog} 
            disabled={!hasCheckedInToday || hasCheckedOutToday || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            Check Out
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.length > 0 ? (
                attendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(attendance.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(attendance.status)}`}>
                        {attendance.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Check In Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckIn}>Check In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Check Out Dialog */}
      <Dialog open={isCheckOutDialogOpen} onOpenChange={setIsCheckOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckOutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckOut}>Check Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}