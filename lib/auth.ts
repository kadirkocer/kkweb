import { NextRequest } from 'next/server'

export interface AuthConfig {
  username?: string
  password?: string
}

export function getAuthConfig(): AuthConfig {
  return {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  }
}

export function validateBasicAuth(request: NextRequest): boolean {
  const { username, password } = getAuthConfig()
  
  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment')
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Basic ')) {
    return false
  }

  try {
    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('ascii')
    const [user, pass] = credentials.split(':')
    return user === username && pass === password
  } catch {
    return false
  }
}

export function createAuthResponse(realm = 'Admin') {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${realm}"`,
      'Content-Type': 'application/json',
    },
  })
}