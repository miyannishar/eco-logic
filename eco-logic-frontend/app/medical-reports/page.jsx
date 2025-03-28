"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MedicalReportContainer from '@/components/MedicalReportContainer';

export default function MedicalReportsPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First, check if the user is authenticated
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const userData = await res.json();
          
          // Get the user's actual MongoDB ID - make sure your API returns the correct field
          // The example shows "67e5d9c0a007e012fd12d6e8" format which looks like MongoDB ObjectId
          const actualUserId = userData._id || userData.id || userData.userId;
          
          if (actualUserId) {
            setUserId(actualUserId);
          } else {
            console.error('No user ID found in profile data:', userData);
            setUserId('current-user'); // Fallback to current-user if no ID found
          }
        } else {
          // Redirect guest users to login
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="mb-6">
        <button
          onClick={() => router.push('/welcome')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 
            dark:hover:text-blue-400 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <MedicalReportContainer userId={userId} />
    </div>
  );
} 