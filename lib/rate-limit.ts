import { NextRequest } from 'next/server'

interface RateLimitEntry {
  tokens: number
  lastRefill: number
  violations: number // Track repeat violations
}

// In-memory token bucket storage with violation tracking
const buckets = new Map<string, RateLimitEntry>()

// Persistent violators (IPs that consistently abuse limits)
const persistentViolators = new Map<string, { count: number; bannedUntil?: number }>()

export interface RateLimitConfig {
  maxTokens: number
  refillRate: number // tokens per second
  windowMs: number
  maxViolations?: number // Max violations before temporary ban
  banDuration?: number // Duration of temporary ban in ms
}

export function getRateLimitConfig(type: 'default' | 'auth' | 'admin' = 'default'): RateLimitConfig {
  const baseConfig = {
    maxTokens: 10,
    refillRate: 1,
    windowMs: 1000,
    maxViolations: 10,
    banDuration: 5 * 60 * 1000, // 5 minutes
  }

  switch (type) {
    case 'auth':
      return {
        ...baseConfig,
        maxTokens: 5, // Stricter for auth
        refillRate: 0.5,
        maxViolations: 5,
        banDuration: 15 * 60 * 1000, // 15 minutes ban for auth abuse
      }
    case 'admin':
      return {
        ...baseConfig,
        maxTokens: 20, // More lenient for authenticated admin users
        refillRate: 2,
        maxViolations: 20,
        banDuration: 60 * 1000, // 1 minute ban
      }
    default:
      return baseConfig
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP
  }

  // Fallback for development
  return '127.0.0.1'
}

export function isIPBanned(ip: string): { banned: boolean; retryAfter?: number } {
  const violator = persistentViolators.get(ip)
  if (!violator || !violator.bannedUntil) return { banned: false }
  
  if (Date.now() > violator.bannedUntil) {
    // Unban IP but keep violation count
    violator.bannedUntil = undefined
    persistentViolators.set(ip, violator)
    return { banned: false }
  }
  
  const retryAfter = Math.ceil((violator.bannedUntil - Date.now()) / 1000)
  return { banned: true, retryAfter }
}

export function recordViolation(ip: string, config: RateLimitConfig): { banned: boolean; retryAfter?: number } {
  const violator = persistentViolators.get(ip) || { count: 0 }
  violator.count++
  
  if (violator.count >= (config.maxViolations || 10)) {
    // Exponential backoff for persistent violators
    const banMultiplier = Math.min(Math.floor(violator.count / (config.maxViolations || 10)), 10)
    const banDuration = (config.banDuration || 5 * 60 * 1000) * banMultiplier
    violator.bannedUntil = Date.now() + banDuration
    
    persistentViolators.set(ip, violator)
    return { banned: true, retryAfter: Math.ceil(banDuration / 1000) }
  }
  
  persistentViolators.set(ip, violator)
  return { banned: false }
}

export function checkRateLimit(identifier: string, type: 'default' | 'auth' | 'admin' = 'default'): { allowed: boolean; retryAfter?: number; violation?: boolean } {
  const config = getRateLimitConfig(type)
  const now = Date.now()
  
  // Extract IP from identifier for ban checking
  const ip = identifier.includes(':') ? identifier.split(':')[1] : identifier
  
  // Check if IP is banned
  const banStatus = isIPBanned(ip)
  if (banStatus.banned) {
    return { allowed: false, retryAfter: banStatus.retryAfter, violation: true }
  }
  
  let bucket = buckets.get(identifier)
  
  if (!bucket) { 
    bucket = { tokens: config.maxTokens, lastRefill: now, violations: 0 }
    buckets.set(identifier, bucket)
  }
  
  // Refill tokens based on elapsed time
  const timePassed = now - bucket.lastRefill
  const tokensToAdd = (timePassed / config.windowMs) * config.refillRate
  
  if (tokensToAdd > 0) { 
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
  }
  
  if (bucket.tokens >= 1) { 
    bucket.tokens--
    // Reset violations on successful requests
    if (bucket.violations > 0) {
      bucket.violations = Math.max(0, bucket.violations - 0.1)
    }
    return { allowed: true }
  }
  
  // Rate limit exceeded
  bucket.violations++
  buckets.set(identifier, bucket)
  
  // Check if this constitutes a violation pattern
  const violationResult = recordViolation(ip, config)
  
  const retryAfter = Math.ceil((1 - bucket.tokens) / config.refillRate)
  return { 
    allowed: false, 
    retryAfter: violationResult.banned ? violationResult.retryAfter : retryAfter,
    violation: true
  }
}

export function createRateLimitResponse(retryAfter: number, violation = false) {
  const message = violation 
    ? 'Rate limit exceeded. Repeated violations may result in temporary ban.'
    : 'Rate limit exceeded. Please slow down your requests.'
    
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter,
      message,
      violation,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString(),
      },
    }
  )
}

export function createBanResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: 'IP temporarily banned',
      retryAfter,
      message: 'Your IP has been temporarily banned due to repeated violations. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-Ban-Reason': 'repeated-violations',
      },
    }
  )
}

// Enhanced rate limiting middleware
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  type: 'default' | 'auth' | 'admin' = 'default'
) {
  return async (request: NextRequest): Promise<Response> => {
    const clientIP = getClientIP(request)
    const identifier = `${type}:${clientIP}`
    
    const rateResult = checkRateLimit(identifier, type)
    
    if (!rateResult.allowed) {
      if (rateResult.violation) {
        const violator = persistentViolators.get(clientIP)
        if (violator?.bannedUntil) {
          return createBanResponse(rateResult.retryAfter || 300)
        }
      }
      
      return createRateLimitResponse(rateResult.retryAfter || 60, rateResult.violation)
    }
    
    try {
      const response = await handler(request)
      
      // Add rate limit headers to successful responses
      const config = getRateLimitConfig(type)
      const bucket = buckets.get(identifier)
      
      if (bucket) {
        response.headers.set('X-RateLimit-Limit', config.maxTokens.toString())
        response.headers.set('X-RateLimit-Remaining', Math.floor(bucket.tokens).toString())
        response.headers.set('X-RateLimit-Reset', new Date(bucket.lastRefill + config.windowMs).toISOString())
      }
      
      return response
    } catch (error) {
      console.error('Rate limit handler error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

// Cleanup old buckets and violations periodically
export function cleanupOldBuckets() {
  const now = Date.now()
  const maxAge = 10 * 60 * 1000 // 10 minutes
  const violatorMaxAge = 24 * 60 * 60 * 1000 // 24 hours for violators

  // Clean up rate limit buckets
  for (const [identifier, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(identifier)
    }
  }
  
  // Clean up old violator records (but keep recent ones for pattern detection)
  for (const [ip, violator] of persistentViolators.entries()) {
    if (!violator.bannedUntil && violator.count < 5) {
      // Remove minor violators after 24 hours
      persistentViolators.delete(ip)
    }
  }
}

// Schedule cleanup if in server environment
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldBuckets, 5 * 60 * 1000) // Every 5 minutes
}