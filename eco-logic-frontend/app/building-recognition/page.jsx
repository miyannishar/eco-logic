"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page for backward compatibility
 * This page redirects users from /building-recognition to /food-analysis
 */
export default function BuildingRecognitionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new path
    router.replace('/food-analysis');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to Food Analysis...</p>
      </div>
    </div>
  );
} 