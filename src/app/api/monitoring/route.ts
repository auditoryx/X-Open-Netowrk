import { NextRequest, NextResponse } from 'next/server';
import { getRecentSecurityEvents, getTrafficMetrics } from '@/lib/security/ddosProtection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'events':
        const limit = parseInt(searchParams.get('limit') || '100');
        const events = getRecentSecurityEvents(limit);
        
        return NextResponse.json({
          events,
          total: events.length
        });
        
      case 'metrics':
        const metrics = getTrafficMetrics();
        
        return NextResponse.json({
          metrics,
          timestamp: new Date().toISOString()
        });
        
      case 'health':
        return NextResponse.json({
          status: 'healthy',
          rateLimiting: 'active',
          ddosProtection: 'active',
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          endpoints: {
            events: '/api/monitoring?action=events&limit=100',
            metrics: '/api/monitoring?action=metrics',
            health: '/api/monitoring?action=health'
          },
          description: 'Rate limiting and DDoS protection monitoring API'
        });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}