import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to demonstrate rate limiting
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const delay = parseInt(searchParams.get('delay') || '0');
  
  // Add artificial delay if requested
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000)));
  }
  
  const headers = new Headers();
  
  // Echo back rate limit headers if they exist
  const rateLimitHeaders = [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining', 
    'X-RateLimit-Reset'
  ];
  
  rateLimitHeaders.forEach(header => {
    const value = req.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });
  
  return NextResponse.json({
    message: 'Test endpoint response',
    timestamp: new Date().toISOString(),
    ip: req.headers.get('x-forwarded-for') || req.ip || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    rateLimit: {
      limit: req.headers.get('X-RateLimit-Limit'),
      remaining: req.headers.get('X-RateLimit-Remaining'),
      reset: req.headers.get('X-RateLimit-Reset'),
    },
    endpoint: 'test',
    method: req.method
  }, { headers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    return NextResponse.json({
      message: 'POST request received',
      timestamp: new Date().toISOString(),
      body,
      endpoint: 'test',
      method: req.method
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 400 }
    );
  }
}