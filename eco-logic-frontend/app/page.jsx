"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import Modal from '../components/Modal';
import Button from '../components/Button';

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
              alt="ECo-logic Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white animate-fade-in">
            Welcome to ECo-logic
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
          <Button
            onClick={() => setShowLoginForm(true)}
            variant="primary"
          >
            Login
          </Button>
          <Button
            onClick={() => setShowSignupForm(true)}
            variant="secondary"
          >
            Sign Up
          </Button>
          <Button
            onClick={() => router.push('/guest-dashboard')}
            variant="outline"
          >
            Continue as Guest
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={showLoginForm} 
        onClose={() => setShowLoginForm(false)}
        title="Welcome Back!"
        subtitle="Sign in to continue"
      >
        <LoginForm 
          onSuccess={handleLoginSuccess} 
          onClose={() => setShowLoginForm(false)} 
          onSwitchToSignup={() => {
            setShowLoginForm(false);
            setShowSignupForm(true);
          }}
        />
      </Modal>

      <Modal 
        isOpen={showSignupForm} 
        onClose={() => setShowSignupForm(false)}
        title="Create Account"
        subtitle="Join ECo-logic today"
      >
        <SignupForm 
          onSuccess={handleSignupSuccess} 
          onClose={() => setShowSignupForm(false)}
          onSwitchToLogin={() => {
            setShowSignupForm(false);
            setShowLoginForm(true);
          }}
        />
      </Modal>
    </div>
  );
}
