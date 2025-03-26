"use client";

import { useState, useCallback, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { diseases, parseResponseData } from '../utils';

// File size limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Accepted file types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Component for uploading files and displaying results
 */
export default function FileUpload({ 
  onBack, 
  onSuccess
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('none');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }
    
    // Check file type
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
    
    if (!isImage && !isVideo) {
      return { 
        valid: false, 
        error: `Unsupported file type. Please upload ${ACCEPTED_IMAGE_TYPES.join(', ')} for images or ${ACCEPTED_VIDEO_TYPES.join(', ')} for videos` 
      };
    }
    
    // Check file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File must be less than ${isVideo ? '50MB' : '5MB'}`
      };
    }
    
    return { 
      valid: true, 
      fileType: isImage ? 'image' : 'video'
    };
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    const result = validateFile(file);
    
    if (!result.valid) {
      setError(result.error);
      return;
    }

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(file);
    setFileType(result.fileType);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }, [previewUrl, validateFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer?.files;
    if (files?.length > 0) {
      const file = files[0];
      const result = validateFile(file);
      
      if (!result.valid) {
        setError(result.error);
        return;
      }
      
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFile(file);
      setFileType(result.fileType);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  }, [previewUrl, validateFile]);

  const clearSelection = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleDiseaseChange = useCallback((e) => {
    setSelectedDisease(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const apiEndpoint = `http://localhost:8000/eco-agent/product-details?userMedicalAilments=${selectedDisease}`;
      console.log('Sending request to API:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      });

      console.log('Response received:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to analyze file';
        try {
          const errorData = await response.text();
          console.error('API Error:', errorData);
          errorMessage = `Failed to analyze file: ${errorData}`;
        } catch (e) {
          console.error('Failed to parse error response', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Parse JSON strings in the response
      const parsedData = parseResponseData(data);
      
      onSuccess({
        prediction: parsedData,
        file: selectedFile,
        previewUrl: previewUrl,
        fileType: fileType
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to analyze file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, selectedDisease, previewUrl, fileType, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Disease Selection Dropdown */}
        <div className="mb-6">
          <label 
            htmlFor="disease-select" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select Medical Condition (if any)
          </label>
          <select
            id="disease-select"
            value={selectedDisease}
            onChange={handleDiseaseChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 
              dark:text-white"
          >
            {diseases.map((disease) => (
              <option key={disease.id} value={disease.id}>
                {disease.name}
              </option>
            ))}
          </select>
        </div>

        {!previewUrl ? (
          // Upload Zone
          <div 
            className={`border-2 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-dashed border-gray-300 dark:border-gray-600'} 
              rounded-lg p-12 transition-colors duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <CloudArrowUpIcon className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white dark:bg-gray-800 font-semibold 
                    text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 
                    focus-within:ring-offset-2 hover:text-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Images (JPG, PNG, GIF, WEBP up to 5MB) or Videos (MP4, WebM up to 50MB)
              </p>
            </div>
          </div>
        ) : (
          // Image Preview
          <div className="relative">
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-2 right-2 bg-red-100 dark:bg-red-900 rounded-full p-2
                hover:bg-red-200 dark:hover:bg-red-800 transition-colors z-10"
              aria-label="Clear selection"
            >
              <XMarkIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </button>
            <div className="relative h-64 w-full mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {fileType === 'video' ? (
                <video
                  src={previewUrl}
                  className="rounded-lg object-contain w-full h-full"
                  controls
                  onError={() => setError('Unable to preview video')}
                />
              ) : (
                <Image
                  src={previewUrl}
                  alt="Selected file"
                  fill
                  className="rounded-lg object-contain"
                  onError={() => setError('Unable to preview image')}
                />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 
              dark:hover:text-white transition-colors"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Analyze File'}
          </button>
        </div>
      </div>
    </form>
  );
} 