import { NextResponse } from 'next/server'
import { getStorage } from '@/lib/storage'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Get storage mode
    const storageMode = process.env.CONTENT_STORAGE === 'FILE' ? 'file' : 
                       process.env.CONTENT_STORAGE === 'GITHUB' ? 'github' :
                       process.env.CONTENT_STORAGE === 'KV' ? 'kv' : 'noop'
    
    // Test storage connectivity
    let storageHealthy = true
    try {
      const storage = getStorage()
      // Simple connectivity test - try to get projects
      await storage.get('projects')
    } catch (error) {
      // Storage test failed, but this is expected for NoopStorage in production
      if (storageMode === 'noop') {
        storageHealthy = true // Expected behavior
      } else {
        storageHealthy = false
      }
    }

    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      environment: process.env.NODE_ENV || 'development',
      storage: {
        mode: storageMode,
        healthy: storageHealthy
      },
      performance: {
        responseTime: `${responseTime}ms`
      },
      features: {
        i18n: true,
        admin: !!process.env.ADMIN_USERNAME,
        monitoring: true,
        telemetry: !process.env.TELEMETRY_DISABLED
      },
      env: {
        metricsEnabled: process.env.METRICS_ENABLED === 'true'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}