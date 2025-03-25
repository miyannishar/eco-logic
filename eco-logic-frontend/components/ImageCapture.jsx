"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ImageCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const router = useRouter();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please ensure you've granted camera permissions.");
    }
  };

  const switchCamera = () => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('image', blob);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('buildingAnalysis', JSON.stringify(result));
        router.push('/building-details');
      } else {
        throw new Error('Failed to analyze image');
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera guide overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full border-2 border-white/30 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
          </div>
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <button
            onClick={switchCamera}
            className="p-3 bg-white/20 rounded-full backdrop-blur-sm"
            title="Switch Camera"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={captureImage}
            disabled={isCapturing}
            className="p-4 bg-white/20 rounded-full backdrop-blur-sm"
          >
            <div className={`w-12 h-12 rounded-full ${
              isCapturing ? 'bg-red-500' : 'bg-white'
            } transition-colors duration-200`}></div>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        Center the building in the frame and tap the capture button
      </div>
    </div>
  );
} 