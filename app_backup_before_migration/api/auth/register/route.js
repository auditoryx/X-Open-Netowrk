import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { uid, name, email, role } = await req.json();
    
    // Generate JWT token
    const backendToken = jwt.sign(
      { id: uid, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // In a production app, you would store user details in your database here
    
    return NextResponse.json({ 
      token: backendToken,
      user: {
        id: uid,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    );
  }
}
