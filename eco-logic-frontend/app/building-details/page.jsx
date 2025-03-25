"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BuildingDetailsPage() {
  const [buildingData, setBuildingData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('buildingAnalysis');
    if (data) {
      setBuildingData(JSON.parse(data));
    }
  }, []);

  if (!buildingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No building data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {buildingData.imagePath && (
          <div className="relative h-64 w-full">
            <Image
              src={buildingData.imagePath}
              alt={buildingData.predictions[0]?.building || "Building"}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            {buildingData.predictions[0]?.building}
          </h1>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-semibold text-blue-800 mb-2">Building Information</h2>
              <p className="text-gray-700">
                Confidence: {(buildingData.predictions[0]?.confidence * 100).toFixed(2)}%
              </p>
            </div>

            {buildingData.navigation?.directions && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="font-semibold text-green-800 mb-2">Navigation</h2>
                <ul className="space-y-2">
                  {buildingData.navigation.directions.map((direction, index) => (
                    <li key={index} className="text-gray-700">{direction}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-4 mt-6">
              <Link 
                href="/map"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg 
                          text-center hover:bg-blue-600 transition-colors"
              >
                View on Map
              </Link>
              <Link 
                href="/camera"
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg 
                          text-center hover:bg-gray-200 transition-colors"
              >
                Scan Another
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 