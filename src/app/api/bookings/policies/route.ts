import { NextRequest, NextResponse } from 'next/server';
import { getCancellationPolicy, getPolicySummary, DEFAULT_POLICIES } from '@/lib/payments/refund-calculator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier') || 'standard';

    // Validate tier
    if (!['standard', 'verified', 'signature'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: standard, verified, or signature' },
        { status: 400 }
      );
    }

    const policy = getCancellationPolicy(tier);
    const summary = getPolicySummary(tier);

    return NextResponse.json({
      tier,
      policy,
      summary,
      allPolicies: {
        standard: DEFAULT_POLICIES.standard,
        verified: DEFAULT_POLICIES.verified,
        signature: DEFAULT_POLICIES.signature
      }
    });

  } catch (error) {
    console.error('Get cancellation policy error:', error);
    return NextResponse.json(
      { error: 'Failed to get cancellation policy' },
      { status: 500 }
    );
  }
}