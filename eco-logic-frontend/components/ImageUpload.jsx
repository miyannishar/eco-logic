"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("Image size should be less than 10MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }

      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
      } else {
        setError("Please drop an image file");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      localStorage.setItem('buildingAnalysis', JSON.stringify(result));
      router.push('/building-details');
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                   transition-colors duration-200 ${
                     preview ? 'border-blue-500' : 'border-gray-300 hover:border-blue-500'
                   }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative aspect-[4/3]">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-sm text-gray-600">
              Click to select or drag and drop an image
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, JPEG up to 10MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedImage || loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium
                   ${loading || !selectedImage
                     ? 'bg-gray-400 cursor-not-allowed'
                     : 'bg-blue-500 hover:bg-blue-600'
                   }`}
      >
        {loading ? 'Processing...' : 'Analyze Image'}
      </button>
    </div>
  );
} 