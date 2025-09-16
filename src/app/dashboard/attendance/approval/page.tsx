'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuth } from '@/lib/auth-context';
import { Attendance } from '@/services/attendance.service';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const AttendanceApprovalPage = () => {
  const { user } = useAuth();
  const { pendingAttendances, loading, error, fetchPendingAttendances, approveAttendance } = useAttendance();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingAttendances();
  }, []);

  const handleApprove = async (attendance: Attendance) => {
    if (!user?.id) return;
    try {
      await approveAttendance(attendance.id, 'approve', user.id);
      toast.success('Attendance approved successfully');
    } catch (error) {
      toast.error('Failed to approve attendance');
    }
  };

  const openRejectDialog = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleReject();
    setIsRejectDialogOpen(false);
  };

  const handleReject = async () => {
    if (!selectedAttendance || !user?.id) return;
    try {
      await approveAttendance(
        selectedAttendance.id,
        'reject',
        user.id,
        rejectionReason
      );
      setIsRejectDialogOpen(false);
      toast.success('Attendance rejected');
    } catch (error) {
      toast.error('Failed to reject attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't show error message, just show empty state
  if (error || !pendingAttendances || pendingAttendances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">No pending attendance records found.</p>
        <Button onClick={fetchPendingAttendances}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Approval</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAttendances && pendingAttendances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Check In</th>
                    <th className="text-left py-3 px-4">Check Out</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Notes</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAttendances.map((attendance: Attendance) => (
                    <tr key={attendance.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {attendance.employee?.firstName} {attendance.employee?.lastName}
                      </td>
                      <td className="py-3 px-4">{attendance.date}</td>
                      <td className="py-3 px-4">{attendance.checkInTime || 'N/A'}</td>
                      <td className="py-3 px-4">{attendance.checkOutTime || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{attendance.status}</Badge>
                      </td>
                      <td className="py-3 px-4">{attendance.notes || 'N/A'}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleApprove(attendance)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => openRejectDialog(attendance)}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending attendance records found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Attendance</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Please provide a reason for rejecting this attendance record:</p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="min-h-[100px]"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive" 
                disabled={!rejectionReason.trim()}
              >
                Reject Attendance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceApprovalPage;