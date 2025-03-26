"use client";

import { useState, useEffect, useRef } from 'react';
import { parseResponseData } from '../utils';

/**
 * Camera component for capturing video/photo
 */
export default function CameraView({ 
  selectedDisease, 
  onSuccess, 
  onError, 
  onBack 
}) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTime = 5; // 5 seconds

  // Initialize camera when component mounts
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        if (!hasCamera) {
          setError('No camera found on your device.');
        }
      } catch (err) {
        console.error('Error checking camera:', err);
      }
    };

    checkCameraAvailability();
    startCamera();

    // Cleanup function to stop camera on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setStream(null);
      }
    };
  }, [facingMode]);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      if (stream) {
        // Restart the camera when orientation changes
        startCamera();
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // First check if we can access the devices
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      // Then get the available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      // Set up constraints based on available devices
      const constraints = {
        audio: true,
        video: {
          facingMode, 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // If on mobile and back camera is preferred, try to use it
      if (videoDevices.length > 1 && facingMode === 'environment') {
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        if (backCamera) {
          constraints.video.deviceId = { exact: backCamera.deviceId };
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        await videoRef.current.play().catch(err => {
          console.error('Video play error:', err);
          throw err;
        });
      }
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError') {
        setError("Camera access denied. Please enable camera permissions in your browser settings.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found on your device.");
      } else if (err.name === 'NotReadableError') {
        setError("Camera is in use by another application.");
      } else {
        setError(`Unable to access camera: ${err.message}`);
      }
      onError(err.message || "Failed to initialize camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  };

  const startRecording = async () => {
    if (!stream) return;
    
    try {
      chunksRef.current = [];
      const options = {
        mimeType: 'video/webm;codecs=vp8,opus'
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const videoFile = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
          
          const formData = new FormData();
          formData.append('file', videoFile);
          
          setIsLoading(true);
          const response = await fetch(
            `http://localhost:8000/eco-agent/product-details?userMedicalAilments=${selectedDisease}`,
            {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json',
              },
              mode: 'cors',
              credentials: 'include',
            }
          );

          if (!response.ok) {
            throw new Error('Failed to upload video');
          }

          const data = await response.json();
          console.log("Raw response data:", data);
          
          // Handle if the response is just environmental pros and cons
          let parsedData = data;
          if (data.alternatives_to_consider && data.harmful_things_about_the_product && data.positive_things_about_the_product) {
            // This appears to be just the environmental pros and cons part
            parsedData = {
              "enviromental pros and cons": data
            };
          } else {
            // Otherwise, parse as normal
            parsedData = parseResponseData(data);
          }
          
          console.log("Processed data:", parsedData);
          
          onSuccess({
            prediction: parsedData,
            file: videoFile, 
            previewUrl: URL.createObjectURL(blob),
            fileType: 'video'
          });
        } catch (error) {
          console.error('Error processing video:', error);
          setError('Failed to process video. Please try again.');
          onError('Failed to process video. Please try again.');
        } finally {
          setIsLoading(false);
          stopCamera();
        }
      };
      
      setIsRecording(true);
      mediaRecorder.start();
      
      let timeLeft = recordingTime;
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          setIsRecording(false);
          setCountdown(null);
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please try again.');
      onError('Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ 
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            width: '100%',
            height: '100%'
          }}
        />

        {/* Recording indicator and countdown */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
            bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center space-x-2"
          >
            <div className="animate-pulse h-3 w-3 rounded-full bg-red-500"></div>
            <span>{countdown}s</span>
          </div>
        )}

        {/* Camera guide overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full border-2 border-white/30 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
          </div>
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          {!isRecording && (
            <>
              {('mediaDevices' in navigator) && (
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
              )}
              
              <button
                onClick={startRecording}
                disabled={isLoading || isRecording}
                className="p-4 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center"
              >
                <div className={`w-12 h-12 rounded-full ${
                  isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500'
                } flex items-center justify-center`}>
                  <div className={`${
                    isRecording ? 'w-6 h-6' : 'w-4 h-4'
                  } bg-white rounded-sm`}></div>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Error message overlay */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 
            dark:hover:text-white transition-colors"
        >
          Back
        </button>
        {!isRecording && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tap to record a 5-second video
          </p>
        )}
      </div>
    </div>
  );
} 