"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const countdownIntervalRef = useRef(null);
  const recordingTime = 5; // 5 seconds

  // Initialize camera when component mounts
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        if (!hasCamera) {
          setError('No camera found on your device.');
          setHasCameraPermission(false);
        } else {
          setHasCameraPermission(true);
        }
      } catch (err) {
        console.error('Error checking camera:', err);
        setHasCameraPermission(false);
      }
    };

    checkCameraAvailability();
    
    if (hasCameraPermission !== false) {
      startCamera();
    }

    // Cleanup function to stop camera on unmount
    return () => {
      stopCameraAndCleanup();
    };
  }, [facingMode, hasCameraPermission]);

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

  // Cleanup all intervals and timers on component unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopCameraAndCleanup();

      // First check if we can access the devices
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);

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
        setHasCameraPermission(false);
      } else if (err.name === 'NotFoundError') {
        setError("No camera found on your device.");
        setHasCameraPermission(false);
      } else if (err.name === 'NotReadableError') {
        setError("Camera is in use by another application.");
      } else {
        setError(`Unable to access camera: ${err.message}`);
      }
      onError(err.message || "Failed to initialize camera");
    }
  }, [facingMode, onError]);

  const stopCameraAndCleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setStream(null);
  }, [stream]);

  const switchCamera = useCallback(() => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  }, []);

  const startRecording = useCallback(async () => {
    if (!stream || isRecording || isLoading) return;
    
    try {
      chunksRef.current = [];
      let options;
      
      try {
        // Try to use most compatible options first
        options = {
          mimeType: 'video/webm;codecs=vp8,opus'
        };
        new MediaRecorder(stream, options); // Test if these options work
      } catch (e) {
        // Fallback options
        console.warn('MediaRecorder with vp8/opus not supported, trying fallback options', e);
        try {
          options = { mimeType: 'video/webm' };
          new MediaRecorder(stream, options);
        } catch (e2) {
          console.warn('MediaRecorder with video/webm not supported, trying video/mp4', e2);
          try {
            options = { mimeType: 'video/mp4' };
            new MediaRecorder(stream, options);
          } catch (e3) {
            console.error('No supported MediaRecorder configuration found', e3);
            options = {};
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          if (chunksRef.current.length === 0) {
            throw new Error('No video data recorded');
          }
          
          // Determine MIME type from the first chunk
          const mimeType = mediaRecorder.mimeType || 'video/webm';
          const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
          
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const videoFile = new File([blob], `recorded-video.${fileExtension}`, { type: mimeType });
          
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
            const errorText = await response.text();
            throw new Error(`Failed to upload video: ${errorText}`);
          }

          const data = await response.json();
          console.log("Raw response data:", data);
          
          // Handle if the response is just environmental pros and cons
          let parsedData = data;
          if (data.alternatives_to_consider && data.harmful_things_about_the_product && data.positive_things_about_the_product) {
            // This appears to be just the environmental pros and cons part
            parsedData = {
              "enviromental pros and cons": data,
              "product_name": "Analyzed Product",
              "product_description": "Environmental impact analysis"
            };
          } else {
            // Otherwise, parse as normal
            parsedData = parseResponseData(data);
          }
          
          console.log("Processed data:", parsedData);
          
          // Only proceed if we still have a valid component mounted
          onSuccess({
            prediction: parsedData,
            file: videoFile, 
            previewUrl: URL.createObjectURL(blob),
            fileType: 'video'
          });
        } catch (error) {
          console.error('Error processing video:', error);
          setError(`Failed to process video: ${error.message}`);
          onError(`Failed to process video: ${error.message}`);
        } finally {
          setIsLoading(false);
          stopCameraAndCleanup();
        }
      };
      
      setIsRecording(true);
      mediaRecorder.start();
      
      let timeLeft = recordingTime;
      setCountdown(timeLeft);
      
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          
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
  }, [stream, isRecording, isLoading, recordingTime, selectedDisease, onSuccess, onError, stopCameraAndCleanup]);

  // Force stop recording (for manual stops)
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    setIsRecording(false);
    setCountdown(null);
  }, []);

  // If camera permission is denied, show only the permission message
  if (hasCameraPermission === false) {
    return (
      <div className="space-y-4">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Camera Access Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Please enable camera access in your browser settings to use this feature."}
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
              {('mediaDevices' in navigator) && navigator.mediaDevices.enumerateDevices && (
                <button
                  onClick={switchCamera}
                  className="p-3 bg-white/20 rounded-full backdrop-blur-sm"
                  title="Switch Camera"
                  disabled={isLoading}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              
              <button
                onClick={startRecording}
                disabled={isLoading || isRecording || !stream}
                className={`p-4 ${!stream || isLoading ? 'bg-gray-500/20' : 'bg-white/20'} rounded-full backdrop-blur-sm 
                  flex items-center justify-center ${!stream || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
          
          {isRecording && (
            <button
              onClick={stopRecording}
              className="p-4 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm"></div>
              </div>
            </button>
          )}
        </div>

        {/* Error message overlay */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-3"></div>
            <p className="text-white font-medium">Processing video...</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 
            dark:hover:text-white transition-colors"
          disabled={isLoading}
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