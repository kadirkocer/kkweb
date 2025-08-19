import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect admin routes with basic auth
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Require environment variables for credentials - no defaults
      const validUser = process.env.ADMIN_USERNAME;
      const validPass = process.env.ADMIN_PASSWORD;

      if (!validUser || !validPass) {
        if (process.env.NODE_ENV !== 'production') {
          return new NextResponse(
            JSON.stringify({
              error: 'Server configuration error',
              message: 'ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set',
              code: 'MISSING_CREDENTIALS'
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          return new NextResponse('Authentication required', {
            status: 401,
            headers: {
              'WWW-Authenticate': 'Basic realm="Admin Panel"',
              'Content-Type': 'text/plain'
            }
          });
        }
      }

      if (user === validUser && pwd === validPass) {
        // Continue with locale handling for admin pages
        const locale = request.cookies.get('locale')?.value || 'tr'
        const response = NextResponse.next()
        response.headers.set('x-locale', locale)
        return response
      }
    }

    // Request basic auth
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Panel"',
        'Content-Type': 'text/plain'
      }
    });
  }
  
  const locale = request.cookies.get('locale')?.value || 'tr'
  
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}