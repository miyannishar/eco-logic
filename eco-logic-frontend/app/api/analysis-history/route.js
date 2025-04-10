import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

// Dynamically import MongoDB connection
const mongodb = require('../../../lib/mongodb');
const connectMongoDB = mongodb.connectMongoDB;

// Create Analysis Result model directly here to avoid import issues
const analysisResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  predictions: { type: Object, required: false },
  navigation: { type: Object, required: false },
  imagePath: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

// Use a function to get the model to prevent "model already defined" errors
function getAnalysisResultModel() {
  return mongoose.models.AnalysisResult || mongoose.model('AnalysisResult', analysisResultSchema);
}

export async function GET(req) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await connectMongoDB();
        
        const AnalysisResult = getAnalysisResultModel();
        const results = await AnalysisResult.find({ userId: session.user.id })
            .sort({ timestamp: -1 })
            .limit(10);

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Error fetching analysis history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis history' },
            { status: 500 }
        );
    }
} 