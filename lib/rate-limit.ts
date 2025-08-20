import { NextRequest } from 'next/server'

interface RateLimitEntry {
  tokens: number
  lastRefill: number
}

// In-memory token bucket storage
const buckets = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxTokens: number
  refillRate: number // tokens per second
  windowMs: number
}

export function getRateLimitConfig(): RateLimitConfig {
  const rateLimit = process.env.RATE_LIMIT || '10rps'
  const match = rateLimit.match(/^(\d+)rps$/)
  const rps = match ? parseInt(match[1]) : 10

  return {
    maxTokens: rps * 10, // burst capacity
    refillRate: rps,
    windowMs: 1000,
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

  // Fallback for development
  return '127.0.0.1'
}

export function checkRateLimit(request: NextRequest): { allowed: boolean; retryAfter?: number } {
  const config = getRateLimitConfig()
  const clientIP = getClientIP(request)
  const now = Date.now()

  let bucket = buckets.get(clientIP)
  if (!bucket) {
    bucket = { tokens: config.maxTokens, lastRefill: now }
    buckets.set(clientIP, bucket)
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill
  const tokensToAdd = (elapsed / 1000) * config.refillRate
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd)
  bucket.lastRefill = now

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    return { allowed: true }
  } else {
    const retryAfter = Math.ceil((1 - bucket.tokens) / config.refillRate)
    return { allowed: false, retryAfter }
  }
}

export function createRateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter,
      message: `Too many requests. Try again in ${retryAfter} seconds.`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  )
}

// Cleanup old buckets periodically (run in background)
export function cleanupOldBuckets() {
  const now = Date.now()
  const maxAge = 5 * 60 * 1000 // 5 minutes

  for (const [ip, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(ip)
    }
  }
}

// Schedule cleanup if in server environment
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldBuckets, 5 * 60 * 1000) // Every 5 minutes
}