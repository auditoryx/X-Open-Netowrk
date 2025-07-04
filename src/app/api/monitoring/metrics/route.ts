import { NextRequest, NextResponse } from 'next/server';

interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

interface MetricsBatch {
  metrics: CustomMetric[];
}

/**
 * API endpoint for receiving performance metrics from the monitoring service
 */
export async function POST(request: NextRequest) {
  try {
    const { metrics }: MetricsBatch = await request.json();
    
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Invalid metrics batch format' },
        { status: 400 }
      );
    }

    // Process and categorize metrics
    const processedMetrics = metrics.map(metric => ({
      ...metric,
      receivedAt: new Date().toISOString(),
      category: categorizeMetric(metric.name),
      priority: determineMetricPriority(metric.name, metric.value)
    }));

    // Group metrics by category for efficient processing
    const metricsByCategory = processedMetrics.reduce((acc, metric) => {
      const category = metric.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(metric);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('📊 Performance Metrics Received:', {
      totalMetrics: processedMetrics.length,
      categories: Object.keys(metricsByCategory),
      categoryCounts: Object.entries(metricsByCategory).reduce((acc, [cat, metrics]) => {
        acc[cat] = metrics.length;
        return acc;
      }, {} as Record<string, number>)
    });

    // Process each category
    await Promise.all([
      processWebVitalsMetrics(metricsByCategory.webVitals || []),
      processPerformanceMetrics(metricsByCategory.performance || []),
      processBusinessMetrics(metricsByCategory.business || []),
      processCustomMetrics(metricsByCategory.custom || [])
    ]);

    // Update real-time dashboards
    await updateRealTimeDashboards(processedMetrics);

    // Check for performance alerts
    await checkPerformanceAlerts(processedMetrics);

    return NextResponse.json({
      success: true,
      processed: processedMetrics.length,
      categories: Object.keys(metricsByCategory)
    });

  } catch (error) {
    console.error('Error processing metrics:', error);
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    );
  }
}

/**
 * Categorize metrics based on name patterns
 */
function categorizeMetric(name: string): string {
  if (name.includes('paint_') || name.includes('layout_shift') || name.includes('first_input')) {
    return 'webVitals';
  }
  if (name.includes('page_load') || name.includes('dns_lookup') || name.includes('tcp_connect')) {
    return 'performance';
  }
  if (name.includes('search_') || name.includes('booking_') || name.includes('user_')) {
    return 'business';
  }
  if (name.includes('benchmark_') || name.includes('long_task')) {
    return 'custom';
  }
  return 'general';
}

/**
 * Determine metric priority for alerting
 */
function determineMetricPriority(name: string, value: number): 'low' | 'medium' | 'high' | 'critical' {
  // Core Web Vitals thresholds
  if (name === 'largest_contentful_paint') {
    if (value > 4000) return 'critical';
    if (value > 2500) return 'high';
    if (value > 1500) return 'medium';
    return 'low';
  }
  
  if (name === 'first_input_delay') {
    if (value > 300) return 'critical';
    if (value > 100) return 'high';
    if (value > 50) return 'medium';
    return 'low';
  }
  
  if (name === 'cumulative_layout_shift') {
    if (value > 0.25) return 'critical';
    if (value > 0.1) return 'high';
    if (value > 0.05) return 'medium';
    return 'low';
  }

  // Page load performance
  if (name === 'page_load_complete') {
    if (value > 10000) return 'critical';
    if (value > 5000) return 'high';
    if (value > 3000) return 'medium';
    return 'low';
  }

  // Long tasks
  if (name === 'long_task') {
    if (value > 500) return 'high';
    if (value > 200) return 'medium';
    return 'low';
  }

  return 'low';
}

/**
 * Process Web Vitals metrics
 */
async function processWebVitalsMetrics(metrics: any[]): Promise<void> {
  if (metrics.length === 0) return;

  console.log('🌐 Processing Web Vitals:', {
    count: metrics.length,
    metrics: metrics.map(m => ({ name: m.name, value: m.value, priority: m.priority }))
  });

  // Calculate averages and percentiles
  const vitalsStats = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = { values: [], unit: metric.unit };
    }
    acc[metric.name].values.push(metric.value);
    return acc;
  }, {} as Record<string, { values: number[], unit: string }>);

  // Calculate statistics for each vital
  const vitalsReport = Object.entries(vitalsStats).map(([name, data]) => {
    const sorted = data.values.sort((a, b) => a - b);
    return {
      name,
      unit: data.unit,
      count: data.values.length,
      average: Math.round(data.values.reduce((a, b) => a + b, 0) / data.values.length),
      median: sorted[Math.floor(sorted.length / 2)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      min: Math.min(...data.values),
      max: Math.max(...data.values)
    };
  });

  console.log('📈 Web Vitals Report:', vitalsReport);

  // In production, store in time-series database
  // await influxDB.writePoints(vitalsReport.map(formatForInflux));
}

/**
 * Process general performance metrics
 */
async function processPerformanceMetrics(metrics: any[]): Promise<void> {
  if (metrics.length === 0) return;

  console.log('⚡ Processing Performance Metrics:', {
    count: metrics.length,
    types: [...new Set(metrics.map(m => m.name))]
  });

  // Group by metric type for analysis
  const performanceGroups = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) acc[metric.name] = [];
    acc[metric.name].push(metric.value);
    return acc;
  }, {} as Record<string, number[]>);

  // Calculate performance trends
  const performanceReport = Object.entries(performanceGroups).map(([name, values]) => ({
    name,
    average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
    trend: calculateTrend(values) // Simple trend calculation
  }));

  console.log('📊 Performance Report:', performanceReport);
}

/**
 * Process business-specific metrics
 */
async function processBusinessMetrics(metrics: any[]): Promise<void> {
  if (metrics.length === 0) return;

  console.log('💼 Processing Business Metrics:', {
    count: metrics.length,
    types: [...new Set(metrics.map(m => m.name))]
  });

  // Extract conversion and engagement metrics
  const businessKPIs = metrics.reduce((acc, metric) => {
    if (metric.name.includes('search_')) {
      acc.searchMetrics.push(metric);
    } else if (metric.name.includes('booking_')) {
      acc.bookingMetrics.push(metric);
    } else if (metric.name.includes('user_')) {
      acc.userMetrics.push(metric);
    }
    return acc;
  }, {
    searchMetrics: [] as any[],
    bookingMetrics: [] as any[],
    userMetrics: [] as any[]
  });

  console.log('💡 Business KPIs:', {
    searchEvents: businessKPIs.searchMetrics.length,
    bookingEvents: businessKPIs.bookingMetrics.length,
    userEvents: businessKPIs.userMetrics.length
  });
}

/**
 * Process custom benchmark metrics
 */
async function processCustomMetrics(metrics: any[]): Promise<void> {
  if (metrics.length === 0) return;

  console.log('🔧 Processing Custom Metrics:', {
    count: metrics.length,
    benchmarks: metrics.filter(m => m.name.includes('benchmark_')).length,
    longTasks: metrics.filter(m => m.name.includes('long_task')).length
  });

  // Analyze custom benchmarks
  const benchmarks = metrics.filter(m => m.name.includes('benchmark_'));
  if (benchmarks.length > 0) {
    const benchmarkReport = benchmarks.reduce((acc, metric) => {
      const benchmarkName = metric.name.replace('benchmark_', '');
      if (!acc[benchmarkName]) acc[benchmarkName] = [];
      acc[benchmarkName].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    console.log('⏱️ Benchmark Report:', Object.entries(benchmarkReport).map(([name, values]) => ({
      name,
      averageMs: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      count: values.length
    })));
  }
}

/**
 * Update real-time dashboards
 */
async function updateRealTimeDashboards(metrics: any[]): Promise<void> {
  try {
    // In production, push to real-time dashboard via WebSocket
    // await websocketService.broadcast('metrics-update', metrics);
    
    // Update Redis cache for dashboard queries
    // await redis.lpush('recent_metrics', JSON.stringify(metrics), 'EX', 300);
    
    console.log('📱 Dashboard updated with latest metrics');
  } catch (error) {
    console.error('Failed to update dashboards:', error);
  }
}

/**
 * Check for performance alerts
 */
async function checkPerformanceAlerts(metrics: any[]): Promise<void> {
  const criticalMetrics = metrics.filter(m => m.priority === 'critical');
  const highPriorityMetrics = metrics.filter(m => m.priority === 'high');

  if (criticalMetrics.length > 0) {
    console.log('🚨 CRITICAL PERFORMANCE ALERT:', {
      count: criticalMetrics.length,
      metrics: criticalMetrics.map(m => ({ name: m.name, value: m.value, unit: m.unit }))
    });

    // Send immediate alerts
    await sendPerformanceAlert('critical', criticalMetrics);
  }

  if (highPriorityMetrics.length > 0) {
    console.log('⚠️ High Priority Performance Issues:', {
      count: highPriorityMetrics.length,
      metrics: highPriorityMetrics.map(m => ({ name: m.name, value: m.value, unit: m.unit }))
    });

    // Send alerts with delay to avoid spam
    await sendPerformanceAlert('high', highPriorityMetrics);
  }
}

/**
 * Send performance alerts
 */
async function sendPerformanceAlert(severity: string, metrics: any[]): Promise<void> {
  try {
    // In production, integrate with alerting systems
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${severity === 'critical' ? '🚨' : '⚠️'} Performance Alert: ${metrics.length} ${severity} performance issues detected`,
          attachments: metrics.map(metric => ({
            color: severity === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Metric', value: metric.name, short: true },
              { title: 'Value', value: `${metric.value}${metric.unit}`, short: true }
            ]
          }))
        })
      });
    }
  } catch (error) {
    console.error('Failed to send performance alert:', error);
  }
}

/**
 * Calculate simple trend (positive = improving, negative = degrading)
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  return ((secondAvg - firstAvg) / firstAvg) * 100;
}
