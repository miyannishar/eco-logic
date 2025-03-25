"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import Image from 'next/image';

export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    router.push('/welcome');
  };

  const handleSignupSuccess = () => {
    setShowSignupForm(false);
    router.push('/welcome');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/environment.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay - adjusted opacity for better video visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6 max-w-3xl mx-auto">
          <div className="mb-6">
            <Image
              src="/images/Logo.jpeg"
              alt="ECo-nnect Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white animate-fade-in">
            Welcome to ECo-nnect
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 animate-fade-in-delay">
          Empowering simple, impactful eco-friendly choices for a sustainable future.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer">
            <div className="text-green-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Food Analysis</h3>
            <p className="text-gray-300">Upload food images to get instant nutritional analysis and eco-friendly alternatives</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer">
            <div className="text-blue-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Health Reports</h3>
            <p className="text-gray-300">Securely upload and manage your health reports with easy tracking and sharing options</p>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="space-x-4">
          <button
            onClick={() => setShowLoginForm(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
          <button
            onClick={() => setShowSignupForm(true)}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/guest-dashboard')}
            className="px-8 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm font-medium"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* Modal Forms */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <LoginForm onSuccess={handleLoginSuccess} onClose={() => setShowLoginForm(false)} />
          </div>
        </div>
      )}

      {showSignupForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <SignupForm onSuccess={handleSignupSuccess} onClose={() => setShowSignupForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
