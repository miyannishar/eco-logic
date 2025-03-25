"use client";

import { useEffect, useState } from 'react';

export default function AnalysisHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/analysis-history');
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }
            const data = await response.json();
            setHistory(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Analysis History</h2>
            <div className="space-y-4">
                {history.map((result) => (
                    <div key={result._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">
                                    Location: {result.navigation.current_location}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(result.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm">
                                    Confidence: {(result.predictions[0].confidence * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Navigation Instructions:</h4>
                            <ul className="text-sm space-y-1">
                                {result.navigation.directions.map((direction, index) => (
                                    <li key={index}>{direction}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <p className="text-center text-gray-500">No analysis history found</p>
                )}
            </div>
        </div>
    );
} 