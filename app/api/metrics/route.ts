import { NextRequest, NextResponse } from 'next/server';
import { withSecureAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';

let register: any = null;
let metricsCollector: any = null;

// Custom metrics for application monitoring
const customMetrics = {
  requestCount: 0,
  errorCount: 0,
  authAttempts: 0,
  rateLimitViolations: 0,
  lastRequestTime: Date.now(),
  uptime: process.uptime(),
}

try {
  if (process.env.METRICS_ENABLED) {
    const { register: promRegister, collectDefaultMetrics, Counter, Histogram, Gauge } = require('prom-client');
    register = promRegister;
    
    // Collect default Node.js metrics
    collectDefaultMetrics();
    
    // Custom application metrics
    metricsCollector = {
      httpRequests: new Counter({
        name: 'kkweb_http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code']
      }),
      httpDuration: new Histogram({
        name: 'kkweb_http_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route']
      }),
      authAttempts: new Counter({
        name: 'kkweb_auth_attempts_total',
        help: 'Total number of authentication attempts',
        labelNames: ['status']
      }),
      rateLimitViolations: new Counter({
        name: 'kkweb_rate_limit_violations_total',
        help: 'Total number of rate limit violations',
        labelNames: ['type']
      }),
      activeConnections: new Gauge({
        name: 'kkweb_active_connections',
        help: 'Number of active connections'
      })
    };
    
    // Register custom metrics
    register.registerMetric(metricsCollector.httpRequests);
    register.registerMetric(metricsCollector.httpDuration);
    register.registerMetric(metricsCollector.authAttempts);
    register.registerMetric(metricsCollector.rateLimitViolations);
    register.registerMetric(metricsCollector.activeConnections);
  }
} catch (error) {
  console.warn('Metrics initialization failed:', error instanceof Error ? error.message : String(error));
  // prom-client not available, graceful degradation
}

// Enhanced metrics endpoint with security
const secureMetricsHandler = withSecureAuth(async (request: NextRequest) => {
  // Check if metrics are enabled
  if (process.env.NODE_ENV === 'production' && !process.env.METRICS_ENABLED) {
    return new NextResponse('Metrics not available', { status: 404 });
  }
  
  try {
    let metricsOutput = '';
    
    if (register) {
      // Get Prometheus metrics
      const promMetrics = await register.metrics();
      metricsOutput += promMetrics;
    }
    
    // Add custom application metrics in Prometheus format
    const now = Date.now();
    customMetrics.uptime = process.uptime();
    customMetrics.lastRequestTime = now;
    
    metricsOutput += `
# HELP kkweb_custom_uptime_seconds Application uptime in seconds
# TYPE kkweb_custom_uptime_seconds gauge
kkweb_custom_uptime_seconds ${customMetrics.uptime}

# HELP kkweb_custom_memory_usage_bytes Memory usage in bytes
# TYPE kkweb_custom_memory_usage_bytes gauge
kkweb_custom_memory_usage_bytes ${process.memoryUsage().heapUsed}

# HELP kkweb_custom_last_request_timestamp Last request timestamp
# TYPE kkweb_custom_last_request_timestamp gauge
kkweb_custom_last_request_timestamp ${customMetrics.lastRequestTime}

# HELP kkweb_custom_request_count_total Total request count
# TYPE kkweb_custom_request_count_total counter
kkweb_custom_request_count_total ${customMetrics.requestCount}

# HELP kkweb_custom_error_count_total Total error count
# TYPE kkweb_custom_error_count_total counter
kkweb_custom_error_count_total ${customMetrics.errorCount}

# HELP kkweb_custom_auth_attempts_total Total auth attempts
# TYPE kkweb_custom_auth_attempts_total counter
kkweb_custom_auth_attempts_total ${customMetrics.authAttempts}

# HELP kkweb_custom_rate_limit_violations_total Total rate limit violations
# TYPE kkweb_custom_rate_limit_violations_total counter
kkweb_custom_rate_limit_violations_total ${customMetrics.rateLimitViolations}
`;
    
    // Security headers for metrics endpoint
    const response = new NextResponse(metricsOutput, { 
      headers: { 
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      } 
    });
    
    return response;
  } catch (error) {
    console.error('Metrics error:', error);
    customMetrics.errorCount++;
    
    return new NextResponse('Internal server error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
});

// Apply rate limiting and export
export const GET = withRateLimit(secureMetricsHandler, 'admin');