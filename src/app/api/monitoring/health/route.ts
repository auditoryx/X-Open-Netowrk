/**
 * Health Check API Endpoint
 * Provides system health status for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceStatus;
    storage: ServiceStatus;
    email: ServiceStatus;
    payments: ServiceStatus;
  };
  metrics: {
    memory: MemoryMetrics;
    responseTime: number;
  };
}

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
}

interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
}

const startTime = Date.now();

export async function GET(request: NextRequest) {
  try {
    const startCheck = Date.now();
    
    // Check all services
    const [database, storage, email, payments] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkStorageHealth(),
      checkEmailHealth(),
      checkPaymentsHealth()
    ]);

    const responseTime = Date.now() - startCheck;

    // Determine overall status
    const services = {
      database: database.status === 'fulfilled' ? database.value : { status: 'unhealthy' as const, error: 'Check failed' },
      storage: storage.status === 'fulfilled' ? storage.value : { status: 'unhealthy' as const, error: 'Check failed' },
      email: email.status === 'fulfilled' ? email.value : { status: 'unhealthy' as const, error: 'Check failed' },
      payments: payments.status === 'fulfilled' ? payments.value : { status: 'unhealthy' as const, error: 'Check failed' }
    };

    const overallStatus = determineOverallStatus(services);

    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        memory: getMemoryMetrics(),
        responseTime
      }
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 207 : 503;

    return NextResponse.json(healthCheck, { status: statusCode });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: Date.now(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

async function checkDatabaseHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    // Simple Firebase check - verify we can access the app
    if (process.env.FIREBASE_PROJECT_ID) {
      // In a real implementation, you'd do a simple read operation
      // For now, just check if environment variables are present
      return {
        status: 'healthy',
        latency: Date.now() - startTime
      };
    } else {
      return {
        status: 'degraded',
        latency: Date.now() - startTime,
        error: 'Firebase configuration missing'
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database check failed'
    };
  }
}

async function checkStorageHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    // Check if Firebase Storage is configured
    if (process.env.FIREBASE_STORAGE_BUCKET) {
      return {
        status: 'healthy',
        latency: Date.now() - startTime
      };
    } else {
      return {
        status: 'degraded',
        latency: Date.now() - startTime,
        error: 'Storage configuration missing'
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Storage check failed'
    };
  }
}

async function checkEmailHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    // Check if email service is configured
    if (process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY) {
      return {
        status: 'healthy',
        latency: Date.now() - startTime
      };
    } else {
      return {
        status: 'degraded',
        latency: Date.now() - startTime,
        error: 'Email service configuration missing'
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Email check failed'
    };
  }
}

async function checkPaymentsHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    // Check if Stripe is configured
    if (process.env.STRIPE_SECRET_KEY) {
      return {
        status: 'healthy',
        latency: Date.now() - startTime
      };
    } else {
      return {
        status: 'degraded',
        latency: Date.now() - startTime,
        error: 'Payment service configuration missing'
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Payment check failed'
    };
  }
}

function determineOverallStatus(services: HealthCheckResult['services']): HealthCheckResult['status'] {
  const statuses = Object.values(services).map(service => service.status);
  
  if (statuses.every(status => status === 'healthy')) {
    return 'healthy';
  } else if (statuses.some(status => status === 'unhealthy')) {
    return 'unhealthy';
  } else {
    return 'degraded';
  }
}

function getMemoryMetrics(): MemoryMetrics {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      used: usage.heapUsed,
      total: usage.heapTotal,
      percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
    };
  }
  
  return {
    used: 0,
    total: 0,
    percentage: 0
  };
}