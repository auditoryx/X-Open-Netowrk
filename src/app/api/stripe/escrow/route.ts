import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { EscrowService } from '@/lib/stripe/escrow';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId, providerId, amount, currency } = await req.json();
    
    if (!bookingId || !providerId || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: bookingId, providerId, amount' 
      }, { status: 400 });
    }

    const escrowService = new EscrowService();
    const result = await escrowService.createEscrowPayment(
      bookingId,
      providerId,
      session.user.id,
      amount,
      currency || 'usd'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Escrow creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create escrow payment',
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
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const providerId = searchParams.get('providerId');
    const customerId = searchParams.get('customerId');
    
    const escrowService = new EscrowService();
    
    if (bookingId) {
      const escrow = await escrowService.getEscrowStatus(bookingId);
      return NextResponse.json(escrow);
    }
    
    if (providerId) {
      const escrows = await escrowService.getEscrowsByProvider(providerId);
      return NextResponse.json({ escrows });
    }
    
    if (customerId) {
      const escrows = await escrowService.getEscrowsByCustomer(customerId);
      return NextResponse.json({ escrows });
    }
    
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  } catch (error) {
    console.error('Failed to get escrow status:', error);
    return NextResponse.json({ 
      error: 'Failed to get escrow status',
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
    const { bookingId, action, reason } = await req.json();
    
    if (!bookingId || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: bookingId, action' 
      }, { status: 400 });
    }

    const escrowService = new EscrowService();
    
    if (action === 'hold') {
      await escrowService.holdEscrowPayment(bookingId);
      return NextResponse.json({ success: true, message: 'Escrow payment held' });
    }
    
    if (action === 'release') {
      await escrowService.releaseEscrowPayment(bookingId);
      return NextResponse.json({ success: true, message: 'Escrow payment released' });
    }
    
    if (action === 'refund') {
      await escrowService.refundEscrowPayment(bookingId, reason);
      return NextResponse.json({ success: true, message: 'Escrow payment refunded' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Escrow action error:', error);
    return NextResponse.json({ 
      error: 'Failed to process escrow action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}