"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapIcon, 
  CameraIcon,
  UserCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export default function WelcomePage() {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      }
    };

    fetchUser();
    setIsFirstVisit(localStorage.getItem('hasVisited') !== 'true');
    localStorage.setItem('hasVisited', 'true');
  }, []);

  const firstName = user?.name?.split(' ')[0] || '';
  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900`}>
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Naksha
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? 
                  <SunIcon className="h-6 w-6 text-gray-400" /> : 
                  <MoonIcon className="h-6 w-6 text-gray-600" />
                }
              </button>
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">{user?.name || 'Loading...'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {timeOfDay()}, {firstName}!
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            What would you like to explore today?
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Campus Map Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-80"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/map" className="block p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <MapIcon className="h-12 w-12 text-blue-500" />
                <ArrowRightIcon className="h-6 w-6 text-gray-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Campus Map
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Interactive map of Fisk University campus with real-time navigation
              </p>
            </Link>
          </motion.div>

          {/* Building Recognition Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-80"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/building-recognition" className="block p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <CameraIcon className="h-12 w-12 text-green-500" />
                <ArrowRightIcon className="h-6 w-6 text-gray-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Building Recognition
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Identify campus buildings using AI-powered image recognition
              </p>
            </Link>
          </motion.div>

          {/* Replace Academic Info Card with About Fisk Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-80"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/about-fisk" className="block p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <svg 
                  className="h-12 w-12 text-amber-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <ArrowRightIcon className="h-6 w-6 text-gray-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                About Fisk
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Explore Fisk University's rich history, historic buildings, and cultural heritage
              </p>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Help Button */}
      <button 
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Get help"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {/* First Visit Tour Modal */}
      {isFirstVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* Tour modal content */}
        </div>
      )}
    </div>
  );
} 