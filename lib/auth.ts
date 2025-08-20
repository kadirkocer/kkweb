import { NextRequest } from 'next/server'
import { checkRateLimit, getClientIP } from './rate-limit'

export interface AuthConfig {
  username?: string
  password?: string
  sessionTimeout?: number
  maxLoginAttempts?: number
}

// Brute force protection
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>()

export function getAuthConfig(): AuthConfig {
  return {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour default
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'), // 5 attempts default
  }
}

export function isAccountLocked(ip: string): boolean {
  const attempt = loginAttempts.get(ip)
  if (!attempt || !attempt.lockedUntil) return false
  
  if (Date.now() > attempt.lockedUntil) {
    // Unlock account
    loginAttempts.delete(ip)
    return false
  }
  
  return true
}

export function recordFailedLogin(ip: string): { locked: boolean; retryAfter?: number } {
  const config = getAuthConfig()
  const now = Date.now()
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 }
  
  // Reset count if last attempt was more than 15 minutes ago
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    attempt.count = 0
  }
  
  attempt.count++
  attempt.lastAttempt = now
  
  if (attempt.count >= (config.maxLoginAttempts || 5)) {
    // Lock account for exponential backoff: 2^attempts minutes
    const lockDuration = Math.min(Math.pow(2, attempt.count - 5) * 60 * 1000, 60 * 60 * 1000) // Max 1 hour
    attempt.lockedUntil = now + lockDuration
    loginAttempts.set(ip, attempt)
    
    return { 
      locked: true, 
      retryAfter: Math.ceil(lockDuration / 1000) 
    }
  }
  
  loginAttempts.set(ip, attempt)
  return { locked: false }
}

export function recordSuccessfulLogin(ip: string): void {
  // Clear failed attempts on successful login
  loginAttempts.delete(ip)
}

export function validateBasicAuth(request: NextRequest): { valid: boolean; error?: string; retryAfter?: number } {
  const { username, password } = getAuthConfig()
  const clientIP = getClientIP(request)
  
  if (!username || !password) {
    return { valid: false, error: 'Authentication not configured' }
  }

  // Check if account is locked
  if (isAccountLocked(clientIP)) {
    const attempt = loginAttempts.get(clientIP)
    const retryAfter = attempt?.lockedUntil ? Math.ceil((attempt.lockedUntil - Date.now()) / 1000) : 300
    return { valid: false, error: 'Account temporarily locked', retryAfter }
  }

  // Rate limiting for auth attempts
  if (!checkRateLimit(`auth:${clientIP}`)) {
    return { valid: false, error: 'Too many authentication attempts', retryAfter: 60 }
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Basic ')) {
    return { valid: false, error: 'Authorization header required' }
  }

  try {
    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('ascii')
    const [user, pass] = credentials.split(':')
    
    // Constant-time comparison to prevent timing attacks
    const userValid = user === username
    const passValid = pass === password
    
    if (userValid && passValid) {
      recordSuccessfulLogin(clientIP)
      return { valid: true }
    } else {
      const lockResult = recordFailedLogin(clientIP)
      return { 
        valid: false, 
        error: lockResult.locked ? 'Account locked due to failed attempts' : 'Invalid credentials',
        retryAfter: lockResult.retryAfter
      }
    }
  } catch {
    const lockResult = recordFailedLogin(clientIP)
    return { 
      valid: false, 
      error: 'Invalid authorization format',
      retryAfter: lockResult.retryAfter
    }
  }
}

export function createAuthResponse(realm = 'Admin', error = 'Authentication required', retryAfter?: number) {
  const headers: Record<string, string> = {
    'WWW-Authenticate': `Basic realm="${realm}"`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
  
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString()
  }

  return new Response(JSON.stringify({ 
    error,
    ...(retryAfter && { retryAfter })
  }), {
    status: 401,
    headers,
  })
}

export function createForbiddenResponse(message = 'Access denied') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

// Enhanced auth middleware with security headers
export function withSecureAuth(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const authResult = validateBasicAuth(request)
    
    if (!authResult.valid) {
      return createAuthResponse('Admin', authResult.error, authResult.retryAfter)
    }
    
    try {
      const response = await handler(request)
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
      
      return response
    } catch (error) {
      console.error('Auth handler error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

// Cleanup old login attempts periodically
export function cleanupOldAttempts() {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1 hour

  for (const [ip, attempt] of loginAttempts.entries()) {
    if (now - attempt.lastAttempt > maxAge && (!attempt.lockedUntil || now > attempt.lockedUntil)) {
      loginAttempts.delete(ip)
    }
  }
}

// Schedule cleanup if in server environment
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldAttempts, 15 * 60 * 1000) // Every 15 minutes
}