import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/getServerUser';
import { GoogleCalendarService } from '@/lib/calendar/google-calendar';
import { z } from 'zod';

const ConnectRequestSchema = z.object({
  provider: z.enum(['google']),
  code: z.string().optional(),
  action: z.enum(['authorize', 'callback', 'disconnect', SCHEMA_FIELDS.BOOKING.STATUS])
});

// Initialize Google Calendar service
const googleCalendarService = new GoogleCalendarService({
  clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI!
});

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const provider = searchParams.get('provider') || 'google';

    const validatedRequest = ConnectRequestSchema.parse({
      provider,
      action,
      code: searchParams.get('code') || undefined
    });

    switch (validatedRequest.action) {
      case 'authorize':
        return handleAuthorize(user.uid, validatedRequest.provider);
      
      case 'callback':
        if (!validatedRequest.code) {
          return NextResponse.json(
            { error: 'Authorization code required' },
            { status: 400 }
          );
        }
        return await handleCallback(user.uid, validatedRequest.code, validatedRequest.provider);
      
      case 'status':
        return await handleStatus(user.uid, validatedRequest.provider);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Calendar connect error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedRequest = ConnectRequestSchema.parse(body);

    switch (validatedRequest.action) {
      case 'disconnect':
        return await handleDisconnect(user.uid, validatedRequest.provider);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action for POST request' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Calendar connect POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle authorization request
 */
function handleAuthorize(userId: string, provider: string) {
  try {
    if (provider === 'google') {
      const authUrl = googleCalendarService.getAuthUrl(userId);
      return NextResponse.json({
        authUrl,
        provider: 'google',
        message: 'Redirect user to authorization URL'
      });
    }

    return NextResponse.json(
      { error: 'Unsupported calendar provider' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}

/**
 * Handle OAuth callback
 */
async function handleCallback(userId: string, code: string, provider: string) {
  try {
    if (provider === 'google') {
      const tokens = await googleCalendarService.exchangeCodeForTokens(code, userId);
      
      return NextResponse.json({
        success: true,
        provider: 'google',
        connected: true,
        message: 'Google Calendar connected successfully',
        tokens: {
          hasAccessToken: !!tokens.accessToken,
          hasRefreshToken: !!tokens.refreshToken,
          expiryDate: tokens.expiryDate
        }
      });
    }

    return NextResponse.json(
      { error: 'Unsupported calendar provider' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect calendar',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle connection status check
 */
async function handleStatus(userId: string, provider: string) {
  try {
    if (provider === 'google') {
      const status = await googleCalendarService.getConnectionStatus(userId);
      
      return NextResponse.json({
        provider: 'google',
        ...status
      });
    }

    return NextResponse.json(
      { error: 'Unsupported calendar provider' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check connection status',
        connected: false
      },
      { status: 500 }
    );
  }
}

/**
 * Handle calendar disconnection
 */
async function handleDisconnect(userId: string, provider: string) {
  try {
    if (provider === 'google') {
      await googleCalendarService.disconnect(userId);
      
      return NextResponse.json({
        success: true,
        provider: 'google',
        connected: false,
        message: 'Google Calendar disconnected successfully'
      });
    }

    return NextResponse.json(
      { error: 'Unsupported calendar provider' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to disconnect calendar',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}