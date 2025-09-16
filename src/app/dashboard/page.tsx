'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendance } from '@/hooks/useAttendance';
import { useLeaves } from '@/hooks/useLeaves';
import { useNotices } from '@/hooks/useNotices';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeaveRequests: 0,
  });

  const { employees } = useEmployees();
  const { attendances } = useAttendance();
  const { leaves } = useLeaves();
  const { notices, loading: noticesLoading } = useNotices();

  useEffect(() => {
    // Calculate stats from actual data
    const calculateStats = () => {
      const today = new Date().toISOString().split('T')[0];
      
      const presentToday = attendances.filter(a => 
        a.date === today && (a.status === 'PRESENT' || a.status === 'LATE')
      ).length;
      
      const onLeave = leaves.filter(l => 
        new Date(l.fromDate) <= new Date() && 
        new Date(l.toDate) >= new Date() && 
        l.status === 'APPROVED'
      ).length;
      
      const pendingLeaveRequests = leaves.filter(l => l.status === 'PENDING').length;
      
      setStats({
        totalEmployees: employees.length,
        presentToday,
        onLeave,
        pendingLeaveRequests,
      });
    };

    calculateStats();
  }, [employees, attendances, leaves]);

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <span className="text-primary-600 text-xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon="👥" />
        <StatCard title="Present Today" value={stats.presentToday} icon="✓" />
        <StatCard title="On Leave" value={stats.onLeave} icon="🏖️" />
        <StatCard title="Pending Leave Requests" value={stats.pendingLeaveRequests} icon="⏳" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Notices</h2>
        <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
          {noticesLoading ? (
            <div className="p-4 text-center">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="p-4 text-center">No notices available</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notices.slice(0, 3).map((notice) => (
                <li key={notice.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {notice.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {new Date(notice.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {notice.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}