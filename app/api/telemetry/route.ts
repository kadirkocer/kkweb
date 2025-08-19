import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const vitalsSchema = z.object({
  name: z.string(),
  value: z.number(),
  id: z.string(),
  delta: z.number(),
  navigationType: z.enum(['navigate', 'reload', 'back_forward', 'back_forward_cache']).optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
})

const errorEventSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  url: z.string(),
  line: z.number().optional(),
  column: z.number().optional(),
  userAgent: z.string().optional(),
})

const telemetryEventSchema = z.object({
  type: z.enum(['vitals', 'error', 'navigation']),
  timestamp: z.string(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  data: z.union([vitalsSchema, errorEventSchema, z.record(z.any())]),
})

// In-memory storage for development (would use persistent storage in production)
const telemetryData: Array<z.infer<typeof telemetryEventSchema> & { id: string }> = []
const MAX_EVENTS = 1000

export async function POST(request: NextRequest) {
  // Check if telemetry is disabled
  if (process.env.TELEMETRY_DISABLED === 'true') {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const body = await request.json()
    const validatedEvent = telemetryEventSchema.parse(body)
    
    // Add to in-memory store with ID and request metadata
    const event = {
      ...validatedEvent,
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }

    telemetryData.push(event)
    
    // Keep only the last N events
    if (telemetryData.length > MAX_EVENTS) {
      telemetryData.splice(0, telemetryData.length - MAX_EVENTS)
    }

    // Log important events in development
    if (process.env.NODE_ENV === 'development') {
      if (validatedEvent.type === 'error') {
        console.error('📊 Client Error:', validatedEvent.data)
      } else if (validatedEvent.type === 'vitals') {
        const vitals = validatedEvent.data as z.infer<typeof vitalsSchema>
        if (vitals.rating === 'poor') {
          console.warn(`📊 Poor ${vitals.name}: ${vitals.value}`)
        }
      }
    }

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    console.error('Telemetry error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid telemetry data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to process telemetry',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Only allow access in development or with proper admin auth
  const basicAuth = request.headers.get('authorization')
  
  if (process.env.NODE_ENV !== 'development') {
    if (!basicAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Telemetry"' }
      })
    }

    const [user, pwd] = atob(basicAuth.split(' ')[1]).split(':')
    if (user !== process.env.ADMIN_USERNAME || pwd !== process.env.ADMIN_PASSWORD) {
      return new NextResponse('Invalid credentials', { status: 401 })
    }
  }

  // Return telemetry data summary
  const now = Date.now()
  const last24h = now - (24 * 60 * 60 * 1000)
  const recentEvents = telemetryData.filter(
    event => new Date((event as any).receivedAt).getTime() > last24h
  )

  const summary = {
    totalEvents: telemetryData.length,
    recentEvents: recentEvents.length,
    eventTypes: {
      vitals: recentEvents.filter(e => e.type === 'vitals').length,
      errors: recentEvents.filter(e => e.type === 'error').length,
      navigation: recentEvents.filter(e => e.type === 'navigation').length,
    },
    vitalsData: recentEvents
      .filter(e => e.type === 'vitals')
      .map(e => e.data as z.infer<typeof vitalsSchema>),
    recentErrors: recentEvents
      .filter(e => e.type === 'error')
      .slice(-10)
      .map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        message: (e.data as z.infer<typeof errorEventSchema>).message,
        url: (e.data as z.infer<typeof errorEventSchema>).url,
      })),
  }

  return NextResponse.json(summary)
}