import { NextResponse } from 'next/server'
import { register } from 'prom-client'

let metricsEnabled = false

// Try to initialize prometheus client
try {
  if (!process.env.METRICS_DISABLED) {
    const promClient = require('prom-client')
    
    // Create default metrics
    promClient.collectDefaultMetrics({
      prefix: 'kkweb_',
    })
    
    // Custom metrics
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

    metricsEnabled = true
  }
} catch (error) {
  // prom-client is optional - gracefully degrade
  metricsEnabled = false
}

export async function GET() {
  if (!metricsEnabled || process.env.METRICS_DISABLED) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const metrics = await register.metrics()
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}