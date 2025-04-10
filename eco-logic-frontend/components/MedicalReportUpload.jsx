"use client";

import { useState, useRef, useEffect } from 'react';
import Button from './Button';
import FormError from './FormError';
import Image from 'next/image';
import config from "@/app/config";

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function MedicalReportUpload({ userId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Please upload a PDF, JPG, JPEG, or PNG file");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size should be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) return;
    
    if (validateFile(file)) {
      setSelectedFile(file);
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      } else {
        // For PDF, just show the filename
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    setError(null);
    
    if (!file) return;
    
    if (validateFile(file)) {
      setSelectedFile(file);
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      } else {
        // For PDF, just show the filename
        setPreview(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("fileInput", selectedFile);

      const response = await fetch(`${config.apiBaseUrl}/report-storage/analyse-and-upload?userId=${userId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload and analyze the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Upload Medical Report
      </h2>

      {!analysisResult ? (
        <>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                      transition-colors duration-200 ${
                        selectedFile ? 'border-blue-500' : 'border-gray-300 hover:border-blue-500'
                      }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && preview ? (
              <div className="mb-4">
                <div className="relative aspect-[4/3] max-h-64 w-full">
                  <Image
                    src={preview}
                    alt="File preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            ) : selectedFile ? (
              <div className="mb-4">
                <div className="flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            ) : (
              <div className="py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop a file, or click to select
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Supports PDF, JPG, JPEG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>

          <FormError message={error} />

          <div className="mt-6 flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              fullWidth
              variant={!selectedFile || loading ? "outline" : "primary"}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Upload & Analyze"}
            </Button>
            
            {selectedFile && (
              <Button
                onClick={resetForm}
                variant="outline"
              >
                Clear
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="result-container p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analysis Results</h3>
            <Button
              onClick={resetForm}
              variant="outline"
            >
              Upload Another Report
            </Button>
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center border-b pb-4 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-36">Report Type:</span>
              <span className="text-gray-900 dark:text-white">{analysisResult['report-category'] || 'Unknown'}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center border-b pb-4 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-36">Filename:</span>
              <span className="text-gray-900 dark:text-white">{analysisResult.filename}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-start border-b pb-4 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-36 pt-1">File Link:</span>
              <a 
                href={analysisResult.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Uploaded File
              </a>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Extracted Information
            </h4>
            {analysisResult['report-content'] && analysisResult['report-content'].length > 0 ? (
              <ul className="space-y-2 pl-5 list-disc text-gray-700 dark:text-gray-300">
                {analysisResult['report-content'].map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No information extracted from the report.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 