"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import CameraView from './CameraView';
import FileUpload from './FileUpload';
import ProductAnalysisResult from './ProductAnalysisResult';

/**
 * Main container component for the Food Analysis feature
 */
export default function FoodAnalysisContainer() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Handle back button click
  const handleBackClick = () => {
    if (isAuthenticated) {
      router.push('/welcome');
    } else {
      router.push('/guest-dashboard');
    }
  };

  // Handle success from camera or file upload
  const handleAnalysisSuccess = (data) => {
    console.log('Analysis success with data:', data);
    setAnalysisData(data);
    setShowResults(true);
    setShowCamera(false);
    
    if (!showUploadSection) {
      setShowUploadSection(false);
    }
  };

  // Handle error from camera or file upload
  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  // Reset to initial view
  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    
    setShowUploadSection(false);
    setShowCamera(false);
    setAnalysisData(null);
  };

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
            {showResults ? "Analysis Results" : "Choose which do you want to analyze"}
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <p>{error}</p>
          </div>
        )}

        {showResults && analysisData && (
          <div>
            <div className="mb-4">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 
                  dark:hover:text-white transition-colors"
              >
                Back to {showUploadSection ? 'Upload' : 'Options'}
              </button>
            </div>
            <ProductAnalysisResult 
              prediction={analysisData.prediction}
              previewUrl={analysisData.previewUrl}
              fileType={analysisData.fileType}
            />
          </div>
        )}

        {!showUploadSection && !showCamera && !showResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Camera Option */}
            <button
              onClick={() => setShowCamera(true)}
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
              onClick={() => setShowUploadSection(true)}
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

        {showCamera && !showResults && (
          <CameraView 
            selectedDisease="none"
            onSuccess={handleAnalysisSuccess}
            onError={handleError}
            onBack={handleBack}
          />
        )}
        
        {showUploadSection && !showResults && (
          <FileUpload 
            onBack={handleBack} 
            onSuccess={handleAnalysisSuccess}
          />
        )}
      </div>
    </div>
  );
} 