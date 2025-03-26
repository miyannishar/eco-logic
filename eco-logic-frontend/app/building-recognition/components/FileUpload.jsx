"use client";

import { useState } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { diseases, parseResponseData } from '../utils';

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError('Please select an image or video file');
        return;
      }

      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File must be less than ${file.type.startsWith('video/') ? '50MB' : '5MB'}`);
        return;
      }

      setSelectedFile(file);
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
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
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to analyze file: ${errorData}`);
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
      setError('Failed to analyze file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

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
            onChange={(e) => setSelectedDisease(e.target.value)}
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
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
            <div className="text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                    type="file"
                    className="sr-only"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Images (PNG, JPG, GIF up to 5MB) or Videos (up to 50MB)
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
            >
              <XMarkIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </button>
            <div className="relative h-64 w-full mb-4">
              {fileType === 'video' ? (
                <video
                  src={previewUrl}
                  className="rounded-lg object-cover w-full h-full"
                  controls
                />
              ) : (
                <Image
                  src={previewUrl}
                  alt="Selected file"
                  fill
                  className="rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 
              dark:hover:text-white transition-colors"
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
            {isLoading ? 'Processing...' : 'Analyze File'}
          </button>
        </div>
      </div>
    </form>
  );
} 