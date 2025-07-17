import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

interface DecodedToken {
  id: string;
  email: string;
  exp: number;
  iat: number;
}

interface VerifyResponse {
  verified: boolean;
  uid: string;
  email: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<VerifyResponse | { error: string }>> {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid token' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify our JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    return NextResponse.json({ 
      verified: true,
      uid: decoded.id,
      email: decoded.email
    });
  } catch (error) {
    logger.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
