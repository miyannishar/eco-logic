import { NextResponse } from 'next/server';
import config from '@/app/config';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Get token from cookie
    const token = request.cookies.get("token")?.value;
    
    // Extract userId from token if available
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded && decoded.userId) {
          formData.append('userId', decoded.userId);
        }
      } catch (tokenError) {
        console.error("Token verification error:", tokenError);
        // Continue without userId if token is invalid
      }
    }
    
    const response = await fetch(
      `${config.apiBaseUrl}/eco-agent/product-details`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Product details API error:", error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 