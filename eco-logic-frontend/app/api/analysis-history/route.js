import { connectMongoDB } from "@/lib/mongodb";
import AnalysisResult from "@/models/analysisResult";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";

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