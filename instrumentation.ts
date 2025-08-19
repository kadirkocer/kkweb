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

// Error logging with context
export function logError(error: Error, context?: Record<string, any>) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    // Redact sensitive information
    sanitizedStack: error.stack?.replace(/password[=:]\s*['"][^'"]*['"]/gi, 'password=***')
                                ?.replace(/token[=:]\s*['"][^'"]*['"]/gi, 'token=***')
                                ?.replace(/key[=:]\s*['"][^'"]*['"]/gi, 'key=***')
  }

  console.error('🚨 Error:', errorLog)
  
  return errorLog
}