"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('image', blob);

      // Send to analysis endpoint
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Store result in localStorage for the details page
        localStorage.setItem('buildingAnalysis', JSON.stringify(result));
        router.push('/building-details');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-screen">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Capture button */}
        <button
          onClick={captureImage}
          disabled={isCapturing}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 
                     bg-white rounded-full p-4 shadow-lg"
        >
          <div className="w-16 h-16 rounded-full border-4 border-blue-500
                        flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full 
                           ${isCapturing ? 'bg-red-500' : 'bg-blue-500'}`}>
            </div>
          </div>
        </button>

        {/* Overlay for building alignment */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full border-2 border-white/30 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 