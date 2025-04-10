import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Dynamically import the connection function
const mongodb = require('../../../../lib/mongodb');
const connectMongoDB = mongodb.connectMongoDB;

// Define User model directly to avoid import issues
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Use a function to get the model to prevent "model already defined" errors
function getUserModel() {
  return mongoose.models.User || mongoose.model('User', userSchema);
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    await connectMongoDB();
    
    // Get the User model
    const User = getUserModel();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Create response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
} 