import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { uid, name, email, role } = await req.json();
    
    const backendToken = jwt.sign(
      { id: uid, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
    
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
