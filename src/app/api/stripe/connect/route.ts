import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { StripeConnectService } from '@/lib/stripe/connect';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await req.json();
    const userEmail = email || session.user.email;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const connectService = new StripeConnectService();
    const accountId = await connectService.createConnectAccount(session.user.id, userEmail);
    const onboardingUrl = await connectService.createAccountLink(accountId, session.user.id);

    return NextResponse.json({ 
      accountId,
      onboardingUrl,
      url: onboardingUrl // For backward compatibility
    });
  } catch (error) {
    console.error('Stripe Connect setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to setup Stripe Connect',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const connectService = new StripeConnectService();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const accountStatus = await connectService.getAccountStatus(accountId);
    const balance = await connectService.getAccountBalance(accountId);
    const payouts = await connectService.getAccountPayouts(accountId);

    return NextResponse.json({
      account: accountStatus,
      balance,
      payouts
    });
  } catch (error) {
    console.error('Failed to get Stripe Connect status:', error);
    return NextResponse.json({ 
      error: 'Failed to get account status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { accountId, action } = await req.json();
    
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const connectService = new StripeConnectService();
    
    if (action === 'refresh_onboarding') {
      const onboardingUrl = await connectService.createAccountLink(accountId, session.user.id);
      return NextResponse.json({ onboardingUrl });
    }
    
    if (action === 'get_login_link') {
      const loginUrl = await connectService.createLoginLink(accountId);
      return NextResponse.json({ loginUrl });
    }
    
    if (action === 'update_status') {
      await connectService.updateAccountStatus(session.user.id, accountId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Stripe Connect update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { accountId } = await req.json();
    
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const connectService = new StripeConnectService();
    await connectService.deleteAccount(accountId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stripe Connect delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
