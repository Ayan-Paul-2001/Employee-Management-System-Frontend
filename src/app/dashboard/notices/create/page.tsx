'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useNotices } from '@/hooks/useNotices';
import { z } from 'zod';

export default function CreateNoticePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    expiresAt: ''
  });
  
  const { createNotice } = useNotices();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect users without permission using useEffect
  useEffect(() => {
    // Remove role check to ensure page is accessible
    console.log('User in create page:', user);
    // No redirect - allow all users to access this page
  }, [user]);

  // Define notice schema with Zod
  const noticeSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    body: z.string().min(10, "Content must be at least 10 characters"),
    expiresAt: z.string().optional().nullable(),
    createdById: z.number({
      required_error: "User ID is required",
      invalid_type_error: "User ID must be a number"
    })
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Make sure user is available and has an ID
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      // Process form data
      const noticeData = {
        ...formData,
        // Handle empty expiration date
        expiresAt: formData.expiresAt || null,
        createdById: user.id
      };
      
      // Validate with Zod
      const validatedData = noticeSchema.parse(noticeData);
      
      // Create notice and handle success
      await createNotice(validatedData);
      router.push('/dashboard/notices');
    } catch (err: any) {
      console.error('Error creating notice:', err);
      // Improved error handling
      if (err instanceof z.ZodError && err.errors && Array.isArray(err.errors)) {
        setError(err.errors.map(e => e.message).join(', '));
      } else if (err.response && err.response.data && err.response.data.message) {
        // Handle API error messages
        setError(err.response.data.message);
      } else {
        setError('Failed to create notice. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Notice</h1>
        <button
          onClick={() => router.push('/dashboard/notices')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"

            />
          </div>
          
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"

            ></textarea>
          </div>
          
          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
            <input
              id="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating... Wait a while' : 'Create Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}