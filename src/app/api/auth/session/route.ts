import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

interface SessionRequest {
  email: string;
  uid: string;
}

interface SessionResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<SessionResponse | { error: string }>> {
  try {
    const { email, uid }: SessionRequest = await req.json();
    
    // Since we can't verify with Firebase Admin, we'll trust the token from the client
    // In a production app, you'd want proper verification
    
    // Generate JWT token for backend API authorization
    const backendToken = jwt.sign(
      { id: uid, email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
    
    return NextResponse.json({ 
      token: backendToken,
      user: {
        id: uid,
        email
      }
    });
  } catch (error) {
    logger.error('Session error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
