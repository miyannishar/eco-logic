import { NextResponse } from 'next/server';
import config from '@/app/config';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
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
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 