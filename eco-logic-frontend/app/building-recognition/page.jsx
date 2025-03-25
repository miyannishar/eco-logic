"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, PhotoIcon, ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function BuildingRecognitionPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [userMedicalAilments, setUserMedicalAilments] = useState('nishar');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(5); // 5 seconds
  const [countdown, setCountdown] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [selectedDisease, setSelectedDisease] = useState('none');

  // Add diseases list
  const diseases = [
    { id: 'none', name: 'No Medical Conditions' },
    { id: 'diabetes', name: 'Diabetes' },
    { id: 'hypertension', name: 'Hypertension' },
    { id: 'celiac', name: 'Celiac Disease' },
    { id: 'lactose', name: 'Lactose Intolerance' },
    { id: 'peanut', name: 'Peanut Allergy' },
    { id: 'shellfish', name: 'Shellfish Allergy' },
    // Add more diseases as needed
  ];

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

  const handleBackClick = () => {
    if (isAuthenticated) {
      router.push('/welcome');
    } else {
      router.push('/guest-dashboard');
    }
  };

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
      setPrediction(null);
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
      setPrediction(data);
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
    setPrediction(null);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getBuildingDescription = (buildingName) => {
    switch (buildingName) {
      case 'chapel':
        return {
          title: 'Fisk Memorial Chapel',
          year: '1892',
          description: 'Fisk Memorial Chapel, built in 1892, stands as a profound symbol of faith and community at Fisk University. This historic Victorian Gothic structure was designed by New York architect William Bigelow and serves as the spiritual center of campus life. The chapel features stunning stained glass windows, intricate woodwork, and excellent acoustics that have hosted countless performances by the renowned Fisk Jubilee Singers.',
          
        };
      case 'cravath':
        return {
          title: 'Cravath Hall',
          year: '1889',
          description: "Cravath Hall, named after Fisk's first president Erastus Milo Cravath, is one of the university's most iconic buildings. Built in 1889, this Victorian Gothic structure originally served as a library and now houses administrative offices. The building is notable for its distinctive clock tower and architectural details that reflect the university's historic legacy. It stands as a testament to Fisk's commitment to academic excellence and leadership.",
          
        };
      case 'jubilee':
        return {
          title: 'Jubilee Hall',
          year: '1876',
          description: 'Jubilee Hall, completed in 1876, holds the distinction of being the first permanent building for African American higher education in the United States. This historic building was funded through the remarkable tours of the original Fisk Jubilee Singers. The Victorian Gothic structure features a distinctive tower and serves as a powerful symbol of African American achievement and perseverance. Today, it continues to function as a residence hall, maintaining its historic significance while serving modern needs.',
          
        };
      default:
        return null;
    }
  };

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
          facingMode, // This will be 'environment' by default
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

      console.log('Using constraints:', constraints);
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
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
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
            `http://localhost:8000/eco-agent/product-details?userMedicalAilments=${userMedicalAilments}`,
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
          setPrediction(data);
          setPreviewUrl(URL.createObjectURL(blob));
          setSelectedFile(videoFile);
          setFileType('video');
          setShowUploadSection(true);
        } catch (error) {
          console.error('Error processing video:', error);
          setError('Failed to process video. Please try again.');
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
      setIsRecording(false);
    }
  };

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

    if (showCamera) {
      checkCameraAvailability();
    }
  }, [showCamera]);

  useEffect(() => {
    if (showCamera) {
      const initCamera = async () => {
        try {
          // Check if the browser supports mediaDevices
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support camera access');
          }

          await startCamera();
        } catch (err) {
          console.error('Camera initialization error:', err);
          setError('Failed to initialize camera. Please try again.');
        }
      };

      initCamera();
    }

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
  }, [showCamera, facingMode]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (showCamera && stream) {
        // Restart the camera when orientation changes
        startCamera();
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [showCamera, stream]);

  // Add this helper function at the top of your file
  const getNutrientValue = (nutrientString) => {
    const value = nutrientString.match(/\d+/);
    return value ? parseInt(value[0]) : 0;
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
            Choose which do you want to analyze
          </p>
        </div>

        {!showUploadSection && !showCamera ? (
          // Options Grid
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
        ) : showCamera ? (
          // Camera View
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
              <canvas ref={canvasRef} className="hidden" />

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
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={stopCamera}
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
        ) : (
          // Upload Section
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
                // Image Preview and Result
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

                  {prediction && (
                    <div className="mt-4 space-y-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                        {/* Product Header */}
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {prediction.product_name}
                          </h2>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {prediction.product_description}
                          </p>
                        </div>

                        {/* Product Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-6">
                            {/* Appearance */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Product Appearance
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {prediction.product_appearance}
                              </p>
                            </div>

                            {/* Ingredients */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Ingredients
                              </h3>
                              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                {prediction.ingridients_used.map((ingredient, index) => (
                                  <li key={index}>{ingredient}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Nutritional Information */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Nutritional Information
                              </h3>
                              <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                  Nutritional Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Calories */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400">Calories</span>
                                      <span className="font-semibold">{getNutrientValue(prediction.nutritional_information[1])}cal</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(getNutrientValue(prediction.nutritional_information[1]) / 2000) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500">% Daily Value based on 2000 cal diet</span>
                                  </div>

                                  {/* Carbohydrates */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400">Carbohydrates</span>
                                      <span className="font-semibold">{getNutrientValue(prediction.nutritional_information[4])}g</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(getNutrientValue(prediction.nutritional_information[4]) / 300) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500">% Daily Value based on 300g recommendation</span>
                                  </div>

                                  {/* Sugars */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400">Sugars</span>
                                      <span className="font-semibold">{getNutrientValue(prediction.nutritional_information[5])}g</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(getNutrientValue(prediction.nutritional_information[5]) / 50) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500">% Daily Value based on 50g recommendation</span>
                                  </div>

                                  {/* Other Nutrients Grid */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
                                      <p className="font-semibold">{getNutrientValue(prediction.nutritional_information[6])}g</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Fat</span>
                                      <p className="font-semibold">{getNutrientValue(prediction.nutritional_information[2])}g</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Sodium</span>
                                      <p className="font-semibold">{getNutrientValue(prediction.nutritional_information[3])}mg</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Serving</span>
                                      <p className="font-semibold">355ml</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Allergens & Warnings */}
                              {(prediction.allergen_information.length > 0 || prediction.cautions_and_warnings.length > 0) && (
                                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                                  <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                    Allergens & Warnings
                                  </h4>
                                  <ul className="space-y-2">
                                    {[...prediction.allergen_information, ...prediction.cautions_and_warnings].map((warning, index) => (
                                      <li key={index} className="flex items-center text-yellow-700 dark:text-yellow-300">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        {warning}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-6">
                            {/* Allergens & Cautions */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Allergens & Warnings
                              </h3>
                              <div className="space-y-2">
                                {prediction.allergen_information.map((allergen, index) => (
                                  <div key={index} className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-2 rounded">
                                    {allergen}
                                  </div>
                                ))}
                                {prediction.cautions_and_warnings.map((warning, index) => (
                                  <div key={index} className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-2 rounded">
                                    {warning}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Environmental Impact */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Environmental Impact
                              </h3>
                              <div className="space-y-4">
                                {/* Pros */}
                                <div>
                                  <h4 className="text-green-600 dark:text-green-400 font-medium mb-2">Positives</h4>
                                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                                    {prediction["enviromental pros and cons"].positive_things_about_the_product.slice(0, 3).map((pro, index) => (
                                      <li key={index}>{pro}</li>
                                    ))}
                                  </ul>
                                </div>
                                {/* Cons */}
                                <div>
                                  <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">Concerns</h4>
                                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                                    {prediction["enviromental pros and cons"].harmful_things_about_the_product.slice(0, 3).map((con, index) => (
                                      <li key={index}>{con}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Health Impact */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Health Considerations
                              </h3>
                              <div className="space-y-4">
                                {/* Pros */}
                                <div>
                                  <h4 className="text-green-600 dark:text-green-400 font-medium mb-2">Benefits</h4>
                                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                                    {prediction["health pros and cons"].positive_things_about_the_product.map((pro, index) => (
                                      <li key={index}>{pro}</li>
                                    ))}
                                  </ul>
                                </div>
                                {/* Cons */}
                                <div>
                                  <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">Risks</h4>
                                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                                    {prediction["health pros and cons"].harmful_things_about_the_product.map((con, index) => (
                                      <li key={index}>{con}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* View Raw Data Button */}
                        <button
                          onClick={() => document.getElementById('rawData').classList.toggle('hidden')}
                          className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 
                            dark:hover:text-gray-300 underline"
                        >
                          Toggle Raw Data
                        </button>
                        <pre
                          id="rawData"
                          className="hidden mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto 
                            max-h-96 text-sm whitespace-pre-wrap"
                        >
                          {JSON.stringify(prediction, null, 2)}
                        </pre>
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
                      onClick={() => setShowUploadSection(false)}
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
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 