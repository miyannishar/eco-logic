"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapIcon,
  CameraIcon,
  UserCircleIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function GuestDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "dark" : ""
      } bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900`}
    >
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/images/econnect.jpeg"
                alt="ECo-logic Logo"
                width={100}
                height={40}
                className="object-contain h-10 w-auto"
                priority
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6 text-gray-400" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">
                  Guest User
                </span>
              </div>
              <button
                onClick={() => router.push("/")}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
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
            Welcome, Guest!
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Campus Map Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-80"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/food-analysis" className="block p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <MapIcon className="h-12 w-12 text-blue-500" />
                <ArrowRightIcon className="h-6 w-6 text-gray-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Food Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Upload food images to get instant nutritional analysis and
                eco-friendly alternatives
              </p>
            </Link>
          </motion.div>

          {/* Building Recognition Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-80"
          >
            {/* Coming Soon Tag */}
            <div className="absolute top-4 right-4 bg-yellow-500 text-black text-sm font-semibold px-3 py-1 rounded-full z-10">
              Coming Soon
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Link href="/food-analysis" className="block p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <CameraIcon className="h-12 w-12 text-green-500" />
                <ArrowRightIcon className="h-6 w-6 text-gray-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Health Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Securely upload and manage your health reports with easy
                tracking and sharing options
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
    </div>
  );
}
