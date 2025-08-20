import { NextRequest } from 'next/server'

let requestCounter = 0

// Simple in-memory request log for development
const requestLog: Array<{
  id: string
  method: string
  url: string
  timestamp: string
  duration?: number
  status?: number
}> = []

const MAX_LOG_ENTRIES = 100

// Global error and metrics aggregation for observability
export const serverMetrics = {
  blockValidationErrors: 0,
  renderErrors: 0,
  requestCount: 0,
  lastErrors: [] as Array<{
    id: string
    timestamp: string
    error: string
    path?: string
    userId?: string
  }>,
}

export async function register() {
  // Only run instrumentation in Node.js runtime
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
    console.log('🔍 Instrumentation initialized')
    
    // Set up global error handling
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection:', {
        reason: reason,
        promise: promise,
        timestamp: new Date().toISOString(),
      })
    })
  }
}

// Request instrumentation helper
export function instrumentRequest(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `req_${++requestCounter}_${Date.now()}`
  
  // Log request start
  const logEntry = {
    id: requestId,
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  }

  // Add to request log (development only)
  if (process.env.NODE_ENV === 'development') {
    requestLog.push(logEntry)
    
    // Keep only the last N entries
    if (requestLog.length > MAX_LOG_ENTRIES) {
      requestLog.shift()
    }
  }

  console.log(`🌐 ${request.method} ${request.url} [${requestId}]`)

  return {
    requestId,
    startTime,
    logEntry,
    end: (status?: number) => {
      const duration = Date.now() - startTime
      
      // Update log entry with completion info
      if (process.env.NODE_ENV === 'development') {
        const entry = requestLog.find(e => e.id === requestId)
        if (entry) {
          entry.duration = duration
          entry.status = status
        }
      }

      const statusColor = status && status >= 400 ? '🔴' : status && status >= 300 ? '🟡' : '🟢'
      console.log(`${statusColor} ${request.method} ${request.url} [${requestId}] ${duration}ms ${status ? `(${status})` : ''}`)
    }
  }
}

// Get request logs (development only)
export function getRequestLogs() {
  if (process.env.NODE_ENV !== 'development') {
    return []
  }
  
  return [...requestLog].reverse() // Most recent first
}

// Enhanced error logging with context and metrics tracking
export function logError(error: Error, context?: Record<string, any>, category?: 'block-validation' | 'render' | 'general') {
  const requestId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const errorLog = {
    id: requestId,
    message: error.message,
    stack: error.stack,
    context: redactSensitive(context),
    category,
    timestamp: new Date().toISOString(),
    // Redact sensitive information
    sanitizedStack: error.stack?.replace(/password[=:]\s*['"][^'"]*['"]/gi, 'password=***')
                                ?.replace(/token[=:]\s*['"][^'"]*['"]/gi, 'token=***')
                                ?.replace(/key[=:]\s*['"][^'"]*['"]/gi, 'key=***')
  }

  console.error('🚨 Error:', errorLog)
  
  // Track metrics
  if (category === 'block-validation') {
    serverMetrics.blockValidationErrors++
  } else if (category === 'render') {
    serverMetrics.renderErrors++
  }
  
  // Store last 20 errors for observability
  serverMetrics.lastErrors.unshift({
    id: requestId,
    timestamp: errorLog.timestamp,
    error: error.message,
    path: context?.path as string,
    userId: context?.userId ? '[USER]' : undefined,
  })
  
  if (serverMetrics.lastErrors.length > 20) {
    serverMetrics.lastErrors = serverMetrics.lastErrors.slice(0, 20)
  }
  
  return errorLog
}

// Redact sensitive information from logs
export function redactSensitive(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential']
  const redacted = { ...obj }
  
  for (const key in redacted) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      redacted[key] = '[REDACTED]'
    } else if (redacted[key] && typeof redacted[key] === 'object') {
      redacted[key] = redactSensitive(redacted[key])
    }
  }
  
  return redacted
}