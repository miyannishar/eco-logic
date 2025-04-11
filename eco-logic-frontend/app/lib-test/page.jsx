"use client";

import { useEffect, useState } from 'react';
import { connectMongoDB, getUserModel } from '@/lib/db';

export default function LibTestPage() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        await connectMongoDB();
        const User = getUserModel();
        setStatus("Connection successful! Models loaded.");
      } catch (error) {
        console.error("Connection error:", error);
        setStatus(`Connection failed: ${error.message}`);
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">MongoDB Connection Test</h1>
        <div className="p-4 border rounded">
          <p className="font-mono">{status}</p>
        </div>
      </div>
    </div>
  );
} 