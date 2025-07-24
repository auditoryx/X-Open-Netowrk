import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AnalyticsEvent } from '@/lib/analytics/config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    // Get session for user context (optional)
    const session = await getServerSession(authOptions);
    
    // Parse the analytics event
    const eventData: AnalyticsEvent = await request.json();
    
    // Validate required fields
    if (!eventData.event || !eventData.category || !eventData.action) {
      return NextResponse.json(
        { error: 'Missing required event fields' },
        { status: 400 }
      );
    }
    
    // Enrich event data with server-side information
    const enrichedEvent = {
      ...eventData,
      // Server-side timestamp
      serverTimestamp: serverTimestamp(),
      clientTimestamp: eventData.timestamp || new Date(),
      
      // Request metadata
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: getClientIP(request),
      referer: request.headers.get('referer') || '',
      
      // Session context (if available)
      authenticatedUserId: session?.user?.id || null,
      userRole: session?.user?.role || null,
      
      // Privacy compliance
      gdprConsent: eventData.properties?.gdprConsent || false,
      ccpaOptOut: eventData.properties?.ccpaOptOut || false,
      
      // Processing metadata
      processed: false,
      processingErrors: null
    };
    
    // Store in Firestore analytics collection
    const analyticsCollection = collection(db, 'analytics_events');
    const docRef = await addDoc(analyticsCollection, enrichedEvent);
    
    // Process high-priority events immediately
    if (isHighPriorityEvent(eventData.event)) {
      await processEventImmediately(enrichedEvent, docRef.id);
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        eventId: docRef.id,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    // Return error response (but don't break user experience)
    return NextResponse.json(
      { 
        error: 'Failed to track event',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Get client IP address from request
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return request.ip || 'unknown';
}

// Check if event requires immediate processing
function isHighPriorityEvent(eventName: string): boolean {
  const highPriorityEvents = [
    'booking_completed',
    'payment_attempted',
    'payment_failed',
    'registration_completed',
    'revenue_generated',
    'refund_processed',
    'security_violation',
    'error_occurred'
  ];
  
  return highPriorityEvents.includes(eventName);
}

// Process high-priority events immediately
async function processEventImmediately(event: any, eventId: string) {
  try {
    // Update business metrics
    await updateBusinessMetrics(event);
    
    // Trigger real-time alerts if needed
    await checkAlertConditions(event);
    
    // Update user segments
    await updateUserSegments(event);
    
    // Mark as processed
    // Note: In a real implementation, you'd update the document
    console.log(`Processed high-priority event: ${event.event} (${eventId})`);
    
  } catch (error) {
    console.error(`Failed to process event ${eventId}:`, error);
  }
}

// Update business metrics based on events
async function updateBusinessMetrics(event: any) {
  const metricsCollection = collection(db, 'business_metrics');
  const today = new Date().toISOString().split('T')[0];
  
  switch (event.event) {
    case 'registration_completed':
      await updateDailyMetric(metricsCollection, today, 'new_registrations', 1);
      break;
      
    case 'booking_completed':
      await updateDailyMetric(metricsCollection, today, 'bookings_completed', 1);
      if (event.properties?.bookingValue) {
        await updateDailyMetric(metricsCollection, today, 'gross_merchandise_value', event.properties.bookingValue);
      }
      break;
      
    case 'revenue_generated':
      if (event.value) {
        await updateDailyMetric(metricsCollection, today, 'platform_revenue', event.value);
      }
      break;
      
    case 'creator_profile_viewed':
      await updateDailyMetric(metricsCollection, today, 'profile_views', 1);
      break;
      
    case 'search_performed':
      await updateDailyMetric(metricsCollection, today, 'searches_performed', 1);
      break;
  }
}

// Update daily metric helper
async function updateDailyMetric(collection: any, date: string, metric: string, value: number) {
  try {
    const docId = `${date}_${metric}`;
    
    // In a real implementation, you'd use atomic increment operations
    // This is a simplified version
    await addDoc(collection, {
      date,
      metric,
      value,
      timestamp: serverTimestamp(),
      type: 'daily_increment'
    });
    
  } catch (error) {
    console.error(`Failed to update metric ${metric}:`, error);
  }
}

// Check for alert conditions
async function checkAlertConditions(event: any) {
  // Define alert conditions
  const alertConditions = [
    {
      condition: event.event === 'payment_failed',
      threshold: 5, // 5 failed payments in short period
      timeWindow: 5 * 60 * 1000, // 5 minutes
      alertType: 'payment_failures_spike'
    },
    {
      condition: event.event === 'error_occurred' && event.properties?.severity === 'critical',
      threshold: 1, // Any critical error
      timeWindow: 60 * 1000, // 1 minute
      alertType: 'critical_error'
    },
    {
      condition: event.event === 'security_violation',
      threshold: 1, // Any security violation
      timeWindow: 60 * 1000, // 1 minute
      alertType: 'security_alert'
    }
  ];
  
  // Check each condition (simplified implementation)
  for (const condition of alertConditions) {
    if (condition.condition) {
      console.log(`Alert triggered: ${condition.alertType}`, event);
      // In a real implementation, you'd send notifications
      // await sendAlert(condition.alertType, event);
    }
  }
}

// Update user segments based on behavior
async function updateUserSegments(event: any) {
  if (!event.authenticatedUserId) return;
  
  const userSegments = collection(db, 'user_segments');
  
  // Define segment rules
  const segmentRules = [
    {
      event: 'booking_completed',
      segment: 'active_clients',
      condition: true
    },
    {
      event: 'revenue_generated',
      segment: 'paying_users',
      condition: event.value > 0
    },
    {
      event: 'creator_profile_updated',
      segment: 'active_creators',
      condition: true
    }
  ];
  
  // Apply segment rules
  for (const rule of segmentRules) {
    if (event.event === rule.event && rule.condition) {
      await addDoc(userSegments, {
        userId: event.authenticatedUserId,
        segment: rule.segment,
        timestamp: serverTimestamp(),
        eventId: event.id,
        eventType: event.event
      });
    }
  }
}

// Options for handling preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}