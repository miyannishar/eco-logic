import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import config from "../../../app/config";
import { connectMongoDB, getAnalysisResultModel } from "../../../lib/db";

export async function POST(req) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Send to Python backend
    const pythonFormData = new FormData();
    pythonFormData.append('file', image);

    const response = await fetch(`${config.apiBaseUrl}/analyze`, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const result = await response.json();

    // Store result in MongoDB
    await connectMongoDB();
    
    const AnalysisResult = getAnalysisResultModel();
    const analysisResult = await AnalysisResult.create({
      userId: session.user.id,
      predictions: result.predictions,
      navigation: result.navigation,
      imagePath: `uploads/${image.name}` 
    });

    return NextResponse.json({
      ...result,
      resultId: analysisResult._id
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 