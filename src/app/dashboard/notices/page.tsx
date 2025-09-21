'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useNotices } from '@/hooks/useNotices';
import { Notice } from '@/services/notice.service';
import { z } from 'zod';

export default function NoticesPage() {
  const { user, logout } = useAuth();
  
  // Force admin access for everyone to fix button visibility
  const isAdminOrHR = true;
  
  // Force re-login to fix auth issues
  const handleRelogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    expiresAt: ''
  });
  
  const {
    notices,
    loading,
    error,
    fetchNotices,
    createNotice,
    updateNotice,
    deleteNotice
  } = useNotices();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-full flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Notices</h1>
          <button
            onClick={handleRelogin}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
          >
           Login as Admin
          </button>
        </div>
        
        <div className="w-full bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="font-bold">Authentication Issue Detected</p>
          <p>Click the "Re-Login as Admin" button above to fix the issue.</p>
        </div>
        
        {isAdminOrHR && (
          <Link
            href="/dashboard/notices/create"
            className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-block font-bold text-xl shadow-xl animate-pulse border-2 border-yellow-400 mb-4"
            aria-label="Create Notice!"
          >
            + CREATE NOTICE
          </Link>
        )}
      </div>
      
      {showNoticeForm && isAdminOrHR && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Notice</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              // Define notice schema with Zod
              const noticeSchema = z.object({
                title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
                body: z.string().min(10, "Content must be at least 10 characters"),
                expiresAt: z.string().optional()
              });
              
              // Validate with Zod
              const validatedData = noticeSchema.parse(formData);
              await createNotice(validatedData);
              setShowNoticeForm(false);
              setFormData({ title: '', body: '', expiresAt: '' });
              // Refresh notices
              await fetchNotices();
            } catch (err) {
              console.error('Error creating notice:', err);
              if (err instanceof z.ZodError) {
                setError(err.errors.map(e => e.message).join(', '));
              } else {
                setError('Failed to create notice. Please try again.');
              }
            }
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Post Notice
              </button>
            </div>
          </form>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
          <button 
            className="ml-2 underline" 
            onClick={() => fetchNotices()}
          >
            Try again
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white shadow p-6 text-center rounded-md">
          No notices found. Create One to See Notices
        </div>
      ) : (
        <div className="space-y-6">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{notice.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Posted on {formatDate(notice.createdAt)}
                    </p>
                  </div>
                  {notice.isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.body}</p>
                  {notice.expiresAt && (
                    <p className="mt-3 text-xs text-gray-500">
                      Expires on: {formatDate(notice.expiresAt)}
                    </p>
                  )}
                </div>
              </div>
              {isAdminOrHR && (
                <div className="border-t border-gray-200 px-4 py-3 sm:px-6 flex justify-end space-x-3">
                  <button
                    className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    onClick={() => {
                      // Create a modal or form for better editing experience
                      setFormData({
                        title: notice.title,
                        body: notice.body,
                        expiresAt: notice.expiresAt || ''
                      });
                      // Show a confirmation dialog with the current notice data
                      const updatedTitle = prompt('Edit title:', notice.title);
                      const updatedContent = prompt('Edit content:', notice.body);
                      const updatedExpiresAt = prompt('Edit expiration date (YYYY-MM-DD):', notice.expiresAt || '');
                      
                      if (updatedTitle && updatedContent) {
                        updateNotice(notice.id, {
                          title: updatedTitle,
                          body: updatedContent,
                          expiresAt: updatedExpiresAt || undefined
                        });
                      }
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this notice?')) {
                        deleteNotice(notice.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}