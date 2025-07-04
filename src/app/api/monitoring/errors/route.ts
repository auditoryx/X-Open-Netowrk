import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userId?: string;
  timestamp: string;
  userAgent: string;
  sessionId: string;
  additionalData?: any;
}

interface ErrorBatch {
  errors: ErrorReport[];
}

/**
 * API endpoint for receiving error reports from the monitoring service
 */
export async function POST(request: NextRequest) {
  try {
    const { errors }: ErrorBatch = await request.json();
    
    if (!Array.isArray(errors) || errors.length === 0) {
      return NextResponse.json(
        { error: 'Invalid error batch format' },
        { status: 400 }
      );
    }

    // Get client information
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const clientIP = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';

    // Process each error
    const processedErrors = errors.map(error => ({
      ...error,
      clientIP,
      receivedAt: new Date().toISOString(),
      severity: determineSeverity(error),
      category: categorizeError(error),
      fingerprint: generateErrorFingerprint(error)
    }));

    // In production, you would:
    // 1. Send to error tracking service (Sentry, Datadog, etc.)
    // 2. Store in database for analysis
    // 3. Send alerts for critical errors
    // 4. Update error metrics

    // For now, log to console and simulate processing
    console.log('📊 Error Reports Received:', {
      count: processedErrors.length,
      criticalErrors: processedErrors.filter(e => e.severity === 'critical').length,
      userAgent,
      clientIP
    });

    // Send critical errors to monitoring service
    const criticalErrors = processedErrors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      await sendCriticalErrorAlerts(criticalErrors);
    }

    // Store errors for analysis (simulate database storage)
    await storeErrors(processedErrors);

    // Update error metrics
    await updateErrorMetrics(processedErrors);

    return NextResponse.json({
      success: true,
      processed: processedErrors.length,
      criticalAlerts: criticalErrors.length
    });

  } catch (error) {
    console.error('Error processing error reports:', error);
    return NextResponse.json(
      { error: 'Failed to process error reports' },
      { status: 500 }
    );
  }
}

/**
 * Determine error severity based on message and context
 */
function determineSeverity(error: ErrorReport): 'low' | 'medium' | 'high' | 'critical' {
  const message = error.message.toLowerCase();
  const url = error.url.toLowerCase();

  // Critical errors
  if (
    message.includes('payment') ||
    message.includes('security') ||
    message.includes('authentication') ||
    message.includes('database') ||
    url.includes('/api/payment') ||
    url.includes('/api/auth')
  ) {
    return 'critical';
  }

  // High severity errors
  if (
    message.includes('booking') ||
    message.includes('user') ||
    message.includes('creator') ||
    message.includes('network') ||
    error.additionalData?.type === 'unhandledRejection'
  ) {
    return 'high';
  }

  // Medium severity errors
  if (
    message.includes('ui') ||
    message.includes('render') ||
    message.includes('component') ||
    error.additionalData?.type === 'react-error'
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Categorize error for better organization
 */
function categorizeError(error: ErrorReport): string {
  const message = error.message.toLowerCase();
  const url = error.url.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) return 'network';
  if (message.includes('payment')) return 'payment';
  if (message.includes('auth')) return 'authentication';
  if (message.includes('database') || message.includes('prisma')) return 'database';
  if (error.additionalData?.type === 'react-error') return 'frontend';
  if (url.includes('/api/')) return 'api';
  if (message.includes('permission')) return 'permissions';
  if (message.includes('validation')) return 'validation';
  
  return 'general';
}

/**
 * Generate unique fingerprint for error deduplication
 */
function generateErrorFingerprint(error: ErrorReport): string {
  const key = `${error.message}_${error.url}_${error.line}_${error.column}`;
  return Buffer.from(key).toString('base64').substring(0, 16);
}

/**
 * Send alerts for critical errors
 */
async function sendCriticalErrorAlerts(errors: any[]): Promise<void> {
  try {
    // In production, integrate with:
    // - Slack/Discord webhooks
    // - Email alerts
    // - PagerDuty
    // - SMS notifications
    
    console.log('🚨 CRITICAL ERROR ALERT:', {
      count: errors.length,
      errors: errors.map(e => ({
        message: e.message,
        url: e.url,
        userId: e.userId,
        timestamp: e.timestamp
      }))
    });

    // Simulate webhook notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Critical Error Alert: ${errors.length} critical errors detected in AuditoryX`,
          attachments: errors.map(error => ({
            color: 'danger',
            fields: [
              { title: 'Error', value: error.message, short: false },
              { title: 'URL', value: error.url, short: true },
              { title: 'User', value: error.userId || 'Anonymous', short: true }
            ]
          }))
        })
      });
    }
  } catch (error) {
    console.error('Failed to send critical error alerts:', error);
  }
}

/**
 * Store errors for analysis
 */
async function storeErrors(errors: any[]): Promise<void> {
  try {
    // In production, store in:
    // - Database (PostgreSQL, MongoDB)
    // - Time-series database (InfluxDB)
    // - Search engine (Elasticsearch)
    
    // Simulate database storage
    console.log('💾 Storing errors in database:', {
      count: errors.length,
      categories: [...new Set(errors.map(e => e.category))],
      severities: errors.reduce((acc, e) => {
        acc[e.severity] = (acc[e.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    // Here you would typically:
    // await prisma.errorReport.createMany({ data: errors });
    
  } catch (error) {
    console.error('Failed to store errors:', error);
  }
}

/**
 * Update error metrics
 */
async function updateErrorMetrics(errors: any[]): Promise<void> {
  try {
    // In production, update metrics in:
    // - Redis counters
    // - Prometheus metrics
    // - CloudWatch metrics
    
    const metrics = {
      totalErrors: errors.length,
      errorsByCategory: errors.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      errorsBySeverity: errors.reduce((acc, e) => {
        acc[e.severity] = (acc[e.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      uniqueUsers: new Set(errors.filter(e => e.userId).map(e => e.userId)).size,
      timestamp: new Date().toISOString()
    };

    console.log('📈 Updated error metrics:', metrics);

    // Simulate metrics update
    // await redis.hincrby('error_metrics', 'total_errors', errors.length);
    // await cloudWatch.putMetricData({ ... });
    
  } catch (error) {
    console.error('Failed to update error metrics:', error);
  }
}
