"use client";

import { useState, useEffect } from 'react';
import MedicalReportUpload from './MedicalReportUpload';
import MedicalReportHistory from './MedicalReportHistory';
import Button from './Button';

export default function MedicalReportContainer({ userId }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [actualUserId, setActualUserId] = useState(userId); // Use the userId passed from parent

  useEffect(() => {
    // Try to get the actual user ID if not already provided
    const fetchUserDetails = async () => {
      if (!userId || userId === 'current-user') {
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const userData = await res.json();
            // Get the MongoDB ID
            const fetchedUserId = userData._id || userData.id || userData.userId;
            if (fetchedUserId) {
              setActualUserId(fetchedUserId);
              setIsAuthenticated(true);
            }
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('User details fetch error:', error);
          setIsAuthenticated(false);
        }
      } else {
        // If userId is already provided, assume user is authenticated
        setIsAuthenticated(true);
      }
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Medical Reports
        </h1>

        <div className="flex space-x-2">
          <Button
            onClick={() => setActiveTab("upload")}
            variant={activeTab === "upload" ? "primary" : "outline"}
          >
            Upload Report
          </Button>
          <Button
            onClick={() => setActiveTab("history")}
            variant={activeTab === "history" ? "primary" : "outline"}
          >
            Report History
          </Button>
        </div>
      </div>

      <div className="relative">
        {activeTab === "upload" ? (
          <MedicalReportUpload 
            userId={actualUserId} 
          />
        ) : (
          <MedicalReportHistory 
            userId={actualUserId} 
          />
        )}
      </div>
    </div>
  );
} 