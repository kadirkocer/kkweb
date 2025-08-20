// Custom metrics tracking utility
const customMetrics = {
  requestCount: 0,
  errorCount: 0,
  authAttempts: 0,
  rateLimitViolations: 0,
}

let metricsCollector: any = null

// Initialize Prometheus metrics if available
try {
  if (process.env.METRICS_ENABLED) {
    const { Counter } = require('prom-client')
    
    metricsCollector = {
      authAttempts: new Counter({
        name: 'kkweb_auth_attempts_total',
        help: 'Total number of authentication attempts',
        labelNames: ['status']
      }),
      rateLimitViolations: new Counter({
        name: 'kkweb_rate_limit_violations_total',
        help: 'Total number of rate limit violations',
        labelNames: ['type']
      })
    }
  }
} catch (error) {
  // Silently fail if prom-client not available
}

// Utility function to record custom metrics
export function recordMetric(type: string, value: number = 1) {
  switch (type) {
    case 'request':
      customMetrics.requestCount += value
      break
    case 'error':
      customMetrics.errorCount += value
      break
    case 'auth_attempt':
      customMetrics.authAttempts += value
      break
    case 'rate_limit_violation':
      customMetrics.rateLimitViolations += value
      break
  }
  
  // Also record to Prometheus if available
  if (metricsCollector) {
    try {
      switch (type) {
        case 'auth_attempt':
          metricsCollector.authAttempts.inc({ status: 'failed' })
          break
        case 'rate_limit_violation':
          metricsCollector.rateLimitViolations.inc({ type: 'general' })
          break
      }
    } catch (error) {
      // Silently fail for metrics recording
    }
  }
}

export function getCustomMetrics() {
  return { ...customMetrics }
}
