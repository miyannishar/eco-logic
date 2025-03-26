"use client";

import { Suspense, lazy, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load the container component for better initial load performance
const FoodAnalysisContainer = lazy(() => 
  import('./components/FoodAnalysisContainer').catch(err => {
    console.error('Failed to load FoodAnalysisContainer:', err);
    return { default: FallbackError };
  })
);

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Food Analysis...</p>
      </div>
    </div>
  );
}

// Simple fallback in case the component fails to load
function FallbackError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Unable to load the Food Analysis component. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Error fallback for the ErrorBoundary
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          {error.message || "An unexpected error occurred while loading the Food Analysis."}
        </p>
        <div className="flex justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Food Analysis Page
 * This page has been refactored to use smaller, more focused components
 * for better maintainability and performance.
 * It includes error boundaries and lazy loading for improved reliability
 * and better loading performance.
 */
export default function FoodAnalysisPage() {
  const [hasError, setHasError] = useState(false);

  // Reset error state if navigation occurs
  useEffect(() => {
    setHasError(false);
  }, []);

  // If ErrorBoundary fails to load, fall back to a simpler error handler
  if (hasError) {
    return <FallbackError />;
  }

  try {
    return (
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={() => setHasError(true)}
      >
        <Suspense fallback={<LoadingFallback />}>
          <FoodAnalysisContainer />
        </Suspense>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Failed to render FoodAnalysisPage:", error);
    return <FallbackError />;
  }
} 