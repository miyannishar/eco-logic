"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import CameraView from './CameraView';
import FileUpload from './FileUpload';
import ProductAnalysisResult from './ProductAnalysisResult';

// Page views
const VIEWS = {
  SELECTION: 'selection',
  CAMERA: 'camera',
  UPLOAD: 'upload',
  RESULTS: 'results'
};

/**
 * Main container component for the Food Analysis feature
 */
export default function FoodAnalysisContainer() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState(VIEWS.SELECTION);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle back button click
  const handleBackClick = useCallback(() => {
    if (isAuthenticated) {
      router.push('/welcome');
    } else {
      router.push('/guest-dashboard');
    }
  }, [router, isAuthenticated]);

  // Handle success from camera or file upload
  const handleAnalysisSuccess = useCallback((data) => {
    console.log('Analysis success with data:', data);
    setAnalysisData(data);
    setCurrentView(VIEWS.RESULTS);
    setError(''); // Clear any previous errors
  }, []);

  // Handle error from camera or file upload
  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  // Reset to initial view
  const handleBack = useCallback(() => {
    if (currentView === VIEWS.RESULTS) {
      // If from results, go back to previous step
      if (analysisData?.fileType === 'video') {
        setCurrentView(VIEWS.CAMERA);
      } else {
        setCurrentView(VIEWS.UPLOAD);
      }
      return;
    }
    
    // Otherwise, go back to initial selection
    setCurrentView(VIEWS.SELECTION);
    // Don't clear analysis data immediately to allow for back navigation
  }, [currentView, analysisData]);

  // Clear any uploaded files if navigating away from upload
  useEffect(() => {
    if (currentView !== VIEWS.UPLOAD && currentView !== VIEWS.RESULTS) {
      // Clean up any file upload URLs if we're not in upload or results view
      if (analysisData?.previewUrl && currentView === VIEWS.SELECTION) {
        URL.revokeObjectURL(analysisData.previewUrl);
        setAnalysisData(null);
      }
    }
  }, [currentView, analysisData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 
              dark:hover:text-blue-400 transition-colors mb-8"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Food Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {currentView === VIEWS.RESULTS 
              ? "Analysis Results" 
              : "Choose which do you want to analyze"}
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
            <button 
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-700 dark:text-red-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results View */}
        {currentView === VIEWS.RESULTS && analysisData && (
          <div>
            <div className="mb-4">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
              >
                Back to {analysisData.fileType === 'video' ? 'Camera' : 'Upload'}
              </button>
            </div>
            <ProductAnalysisResult 
              prediction={analysisData.prediction}
              previewUrl={analysisData.previewUrl}
              fileType={analysisData.fileType}
            />
          </div>
        )}

        {/* Initial Options View */}
        {currentView === VIEWS.SELECTION && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Camera Option */}
            <button
              onClick={() => setCurrentView(VIEWS.CAMERA)}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 
                hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-left"
            >
              <div className="flex items-center justify-center mb-6">
                <CameraIcon className="h-16 w-16 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                Use Camera
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Take a photo of a food item to get all the analysis
              </p>
            </button>

            {/* Upload Option */}
            <button
              onClick={() => setCurrentView(VIEWS.UPLOAD)}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 
                hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-left"
            >
              <div className="flex items-center justify-center mb-6">
                <PhotoIcon className="h-16 w-16 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                Upload Image
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Upload an existing photo from your device
              </p>
            </button>
          </div>
        )}

        {/* Camera View */}
        {currentView === VIEWS.CAMERA && (
          <CameraView 
            selectedDisease="none"
            onSuccess={handleAnalysisSuccess}
            onError={handleError}
            onBack={handleBack}
          />
        )}
        
        {/* Upload View */}
        {currentView === VIEWS.UPLOAD && (
          <FileUpload 
            onBack={handleBack} 
            onSuccess={handleAnalysisSuccess}
          />
        )}
      </div>
    </div>
  );
} 