import { NextRequest, NextResponse } from 'next/server'
import { validateBasicAuth, createAuthResponse } from '@/lib/auth'
import { serverMetrics } from '@/instrumentation'

let metricsEnabled = false
let register: any = null

// Try to initialize prometheus client
try {
  if (process.env.METRICS_ENABLED === 'true') {
    const promClient = require('prom-client')
    register = promClient.register
    
    // Create default metrics
    promClient.collectDefaultMetrics({
      prefix: 'kkweb_',
    })
    
    // Custom metrics for our app
    const httpRequestsTotal = new promClient.Counter({
      name: 'kkweb_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    })

    const httpRequestDuration = new promClient.Histogram({
      name: 'kkweb_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5]
    })

    const blockValidationErrors = new promClient.Counter({
      name: 'kkweb_block_validation_errors_total',
      help: 'Total number of block validation errors',
    })

    const renderErrors = new promClient.Counter({
      name: 'kkweb_render_errors_total',
      help: 'Total number of render errors',
    })

    // Update counters from serverMetrics
    blockValidationErrors.inc(serverMetrics.blockValidationErrors)
    renderErrors.inc(serverMetrics.renderErrors)

    metricsEnabled = true
  }
} catch (error) {
  // prom-client is optional - gracefully degrade
  metricsEnabled = false
}

export async function GET(request: NextRequest) {
  // Security: Check if metrics are enabled
  if (process.env.NODE_ENV === 'production' && process.env.METRICS_ENABLED !== 'true') {
    return new NextResponse(null, { status: 404 })
  }

  // Security: Optional Basic Auth protection
  if (process.env.METRICS_BASIC === '1') {
    try {
      if (!validateBasicAuth(request)) {
        return createAuthResponse('Metrics')
      }
    } catch (error) {
      return NextResponse.json({
        error: 'Configuration error',
        message: 'ADMIN_USERNAME and ADMIN_PASSWORD must be set when METRICS_BASIC=1'
      }, { status: 500 })
    }
  }

  // Return 204 in dev if prom-client not available
  if (!metricsEnabled || !register) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const metrics = await register.metrics()
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}