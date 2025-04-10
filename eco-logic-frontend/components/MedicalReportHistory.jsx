"use client";

import { useState, useEffect } from 'react';
import Button from './Button';
import FormError from './FormError';
import config from "@/app/config";

export default function MedicalReportHistory({ userId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${config.apiBaseUrl}/report-storage/fetch-user-reports-url?userId=${userId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load report history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [userId]);

  const toggleReportDetails = (reportId) => {
    if (expandedReport === reportId) {
      setExpandedReport(null);
    } else {
      setExpandedReport(reportId);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString; // Return the original string if parsing fails
    }
  };

  // Get icon based on report type
  const getReportIcon = (category) => {
    const lowerCategory = (category || '').toLowerCase();
    
    if (lowerCategory.includes('blood')) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    } else if (lowerCategory.includes('x-ray') || lowerCategory.includes('scan') || lowerCategory.includes('mri') || lowerCategory.includes('ct')) {
      return (
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    } else if (lowerCategory.includes('prescription')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      // Default document icon
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Medical Report History
        </h2>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Medical Report History
      </h2>
      
      <FormError message={error} />
      
      {reports.length === 0 && !error ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            No medical reports found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Upload a report to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report['file-id']} 
              className="border dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200"
            >
              <div 
                className="flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                onClick={() => toggleReportDetails(report['file-id'])}
              >
                <div className="flex-shrink-0 mr-4">
                  {getReportIcon(report['report-category'])}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {report['report-category'] || 'Medical Report'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.filename}
                  </p>
                  {report.uploadDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {formatDate(report.uploadDate)}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-2">
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedReport === report['file-id'] ? 'transform rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedReport === report['file-id'] && (
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <div className="space-y-4">
                    {report['report-content'] && report['report-content'].length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Report Details:
                        </h4>
                        <ul className="space-y-1 pl-5 list-disc text-gray-700 dark:text-gray-300">
                          {report['report-content'].map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        No details available for this report.
                      </p>
                    )}
                    
                    <div className="flex justify-end pt-2">
                      <a 
                        href={report.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <span>View Report</span>
                        <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 