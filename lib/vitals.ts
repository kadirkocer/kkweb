'use client'

import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

export interface VitalsData {
  name: string
  value: number
  id: string
  delta: number
  navigationType?: string
  rating?: 'good' | 'needs-improvement' | 'poor'
}

// Send vitals data to telemetry endpoint
function sendToTelemetry(metric: Metric) {
  // Only send if telemetry is not disabled
  if (process.env.NEXT_PUBLIC_TELEMETRY_DISABLED === 'true') {
    return
  }

  const sessionId = getSessionId()
  
  try {
    fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'vitals',
        timestamp: new Date().toISOString(),
        sessionId,
        data: {
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          navigationType: (metric as any).navigationType,
          rating: (metric as any).rating,
        },
      }),
    }).catch(error => {
      // Silently fail - don't let telemetry errors break the app
      console.debug('Telemetry error:', error)
    })
  } catch (error) {
    console.debug('Telemetry error:', error)
  }
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('vitals-session-id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('vitals-session-id', sessionId)
  }
  return sessionId
}

// Track all web vitals
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  onCLS(sendToTelemetry)
  onFCP(sendToTelemetry)
  onLCP(sendToTelemetry)
  onTTFB(sendToTelemetry)
}

// Track custom events
export function trackEvent(eventName: string, data: any = {}) {
  if (process.env.NEXT_PUBLIC_TELEMETRY_DISABLED === 'true') {
    return
  }

  const sessionId = getSessionId()
  
  try {
    fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'navigation',
        timestamp: new Date().toISOString(),
        sessionId,
        data: {
          event: eventName,
          ...data,
        },
      }),
    }).catch(error => {
      console.debug('Telemetry error:', error)
    })
  } catch (error) {
    console.debug('Telemetry error:', error)
  }
}

// Track client-side errors
export function trackError(error: Error, url?: string) {
  if (process.env.NEXT_PUBLIC_TELEMETRY_DISABLED === 'true') {
    return
  }

  const sessionId = getSessionId()
  
  try {
    fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'error',
        timestamp: new Date().toISOString(),
        sessionId,
        data: {
          message: error.message,
          stack: error.stack,
          url: url || window.location.href,
          userAgent: navigator.userAgent,
        },
      }),
    }).catch(err => {
      console.debug('Telemetry error:', err)
    })
  } catch (err) {
    console.debug('Telemetry error:', err)
  }
}

// Auto-setup error tracking
if (typeof window !== 'undefined') {
  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackError(event.error, event.filename)
  })

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), window.location.href)
  })
}