import { 
  collection, 
  doc, 
  getDocs, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PerformanceMetric {
  id?: string;
  metricType: 'xp_award_latency' | 'validation_time' | 'database_query' | 'api_response' | 'user_interaction';
  operation: string;
  duration: number; // milliseconds
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: any;
  success: boolean;
  errorMessage?: string;
}

interface SystemHealthCheck {
  timestamp: any;
  xpServiceHealth: {
    status: 'healthy' | 'warning' | 'critical';
    avgResponseTime: number;
    errorRate: number;
    dailyXPAwarded: number;
  };
  validationServiceHealth: {
    status: 'healthy' | 'warning' | 'critical';
    avgValidationTime: number;
    alertsGenerated: number;
    falsePositiveRate: number;
  };
  databaseHealth: {
    status: 'healthy' | 'warning' | 'critical';
    avgQueryTime: number;
    connectionPool: number;
    slowQueries: number;
  };
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Record a performance metric
   */
  async recordMetric(
    metricType: PerformanceMetric['metricType'],
    operation: string,
    duration: number,
    success: boolean,
    userId?: string,
    metadata?: Record<string, any>,
    errorMessage?: string
  ): Promise<void> {
    try {
      const metric: PerformanceMetric = {
        metricType,
        operation,
        duration,
        userId,
        metadata,
        timestamp: serverTimestamp(),
        success,
        errorMessage
      };

      // Only log metrics if duration is concerning or there's an error
      if (duration > 1000 || !success || this.shouldSample()) {
        await addDoc(collection(db, 'performanceMetrics'), metric);
      }

      // Alert if critical performance issues
      if (duration > 5000 || !success) {
        await this.alertCriticalPerformance(metric);
      }
    } catch (error) {
      console.error('Error recording performance metric:', error);
      // Don't throw - monitoring shouldn't break the main flow
    }
  }

  /**
   * Measure and record XP operation performance
   */
  async measureXPOperation<T>(
    operation: string,
    asyncOperation: () => Promise<T>,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;
    let result: T;

    try {
      result = await asyncOperation();
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      
      // Record metric asynchronously to not affect performance
      this.recordMetric(
        'xp_award_latency',
        operation,
        duration,
        success,
        userId,
        metadata,
        errorMessage
      ).catch(console.error);
    }
  }

  /**
   * Measure validation performance
   */
  async measureValidation<T>(
    operation: string,
    asyncOperation: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;

    try {
      const result = await asyncOperation();
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      
      this.recordMetric(
        'validation_time',
        operation,
        duration,
        success,
        userId,
        undefined,
        errorMessage
      ).catch(console.error);
    }
  }

  /**
   * Get performance statistics for dashboard
   */
  async getPerformanceStats(timeframeHours: number = 24): Promise<{
    avgXPAwardTime: number;
    avgValidationTime: number;
    errorRate: number;
    slowOperations: number;
    totalOperations: number;
  }> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - timeframeHours);

      const metricsQuery = query(
        collection(db, 'performanceMetrics'),
        where('timestamp', '>', Timestamp.fromDate(cutoffTime)),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const metricsSnapshot = await getDocs(metricsQuery);
      const metrics = metricsSnapshot.docs.map(doc => doc.data()) as PerformanceMetric[];

      const xpMetrics = metrics.filter(m => m.metricType === 'xp_award_latency');
      const validationMetrics = metrics.filter(m => m.metricType === 'validation_time');
      
      const avgXPAwardTime = xpMetrics.length > 0 
        ? xpMetrics.reduce((sum, m) => sum + m.duration, 0) / xpMetrics.length 
        : 0;

      const avgValidationTime = validationMetrics.length > 0
        ? validationMetrics.reduce((sum, m) => sum + m.duration, 0) / validationMetrics.length
        : 0;

      const errorRate = metrics.length > 0 
        ? (metrics.filter(m => !m.success).length / metrics.length) * 100 
        : 0;

      const slowOperations = metrics.filter(m => m.duration > 2000).length;

      return {
        avgXPAwardTime,
        avgValidationTime,
        errorRate,
        slowOperations,
        totalOperations: metrics.length
      };
    } catch (error) {
      console.error('Error getting performance stats:', error);
      return {
        avgXPAwardTime: 0,
        avgValidationTime: 0,
        errorRate: 0,
        slowOperations: 0,
        totalOperations: 0
      };
    }
  }

  /**
   * Perform system health check
   */
  async performHealthCheck(): Promise<SystemHealthCheck> {
    try {
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      // Get recent performance metrics
      const metricsQuery = query(
        collection(db, 'performanceMetrics'),
        where('timestamp', '>', Timestamp.fromDate(last24Hours)),
        limit(500)
      );

      const metricsSnapshot = await getDocs(metricsQuery);
      const metrics = metricsSnapshot.docs.map(doc => doc.data()) as PerformanceMetric[];

      // Get recent XP transactions for health analysis
      const xpQuery = query(
        collection(db, 'xpTransactions'),
        where('timestamp', '>', Timestamp.fromDate(last24Hours)),
        limit(100)
      );

      const xpSnapshot = await getDocs(xpQuery);
      const dailyXPAwarded = xpSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().xpAwarded || 0);
      }, 0);

      // Get validation alerts
      const alertsQuery = query(
        collection(db, 'validationAlerts'),
        where('timestamp', '>', Timestamp.fromDate(last24Hours)),
        where('resolved', '==', false)
      );

      const alertsSnapshot = await getDocs(alertsQuery);

      // Calculate health metrics
      const xpMetrics = metrics.filter(m => m.metricType === 'xp_award_latency');
      const validationMetrics = metrics.filter(m => m.metricType === 'validation_time');
      const dbMetrics = metrics.filter(m => m.metricType === 'database_query');

      const xpAvgTime = xpMetrics.length > 0 
        ? xpMetrics.reduce((sum, m) => sum + m.duration, 0) / xpMetrics.length 
        : 0;

      const xpErrorRate = xpMetrics.length > 0 
        ? (xpMetrics.filter(m => !m.success).length / xpMetrics.length) * 100 
        : 0;

      const validationAvgTime = validationMetrics.length > 0
        ? validationMetrics.reduce((sum, m) => sum + m.duration, 0) / validationMetrics.length
        : 0;

      const dbAvgTime = dbMetrics.length > 0
        ? dbMetrics.reduce((sum, m) => sum + m.duration, 0) / dbMetrics.length
        : 0;

      return {
        timestamp: serverTimestamp(),
        xpServiceHealth: {
          status: this.determineHealthStatus(xpAvgTime, 1000, xpErrorRate, 5),
          avgResponseTime: xpAvgTime,
          errorRate: xpErrorRate,
          dailyXPAwarded
        },
        validationServiceHealth: {
          status: this.determineHealthStatus(validationAvgTime, 500, 0, 0),
          avgValidationTime: validationAvgTime,
          alertsGenerated: alertsSnapshot.size,
          falsePositiveRate: 0 // TODO: Calculate based on resolved alerts
        },
        databaseHealth: {
          status: this.determineHealthStatus(dbAvgTime, 200, 0, 0),
          avgQueryTime: dbAvgTime,
          connectionPool: 100, // Mock value - would come from actual monitoring
          slowQueries: dbMetrics.filter(m => m.duration > 1000).length
        }
      };
    } catch (error) {
      console.error('Error performing health check:', error);
      return {
        timestamp: serverTimestamp(),
        xpServiceHealth: {
          status: 'critical',
          avgResponseTime: 0,
          errorRate: 100,
          dailyXPAwarded: 0
        },
        validationServiceHealth: {
          status: 'critical',
          avgValidationTime: 0,
          alertsGenerated: 0,
          falsePositiveRate: 0
        },
        databaseHealth: {
          status: 'critical',
          avgQueryTime: 0,
          connectionPool: 0,
          slowQueries: 0
        }
      };
    }
  }

  /**
   * Alert for critical performance issues
   */
  private async alertCriticalPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      await addDoc(collection(db, 'systemAlerts'), {
        type: 'performance_critical',
        metric,
        timestamp: serverTimestamp(),
        resolved: false,
        severity: 'high'
      });
    } catch (error) {
      console.error('Error creating critical performance alert:', error);
    }
  }

  /**
   * Determine health status based on metrics
   */
  private determineHealthStatus(
    avgTime: number, 
    warningThreshold: number, 
    errorRate: number, 
    errorThreshold: number
  ): 'healthy' | 'warning' | 'critical' {
    if (errorRate > errorThreshold || avgTime > warningThreshold * 2) {
      return 'critical';
    } else if (avgTime > warningThreshold || errorRate > errorThreshold / 2) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  /**
   * Simple sampling to avoid overwhelming the metrics collection
   */
  private shouldSample(): boolean {
    return Math.random() < 0.1; // Sample 10% of normal operations
  }

  /**
   * Get slow operations for analysis
   */
  async getSlowOperations(limit: number = 20): Promise<PerformanceMetric[]> {
    try {
      const slowQuery = query(
        collection(db, 'performanceMetrics'),
        where('duration', '>', 2000),
        orderBy('duration', 'desc'),
        orderBy('timestamp', 'desc'),
        limit
      );

      const slowSnapshot = await getDocs(slowQuery);
      return slowSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PerformanceMetric[];
    } catch (error) {
      console.error('Error getting slow operations:', error);
      return [];
    }
  }
}

// Export singleton instance
export const performanceMonitoringService = PerformanceMonitoringService.getInstance();
