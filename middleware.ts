import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin', '/api/admin'];
const METRICS_PATH = '/api/metrics';

function verifyBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) return false;
  
  const base64 = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic Auth for admin routes
  if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { error: 'Missing ADMIN_USERNAME and ADMIN_PASSWORD in .env' },
          { status: 500 }
        );
      }
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    if (!verifyBasicAuth(request)) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
      });
    }
  }

  // Metrics endpoint protection
  if (pathname === METRICS_PATH) {
    if (process.env.NODE_ENV === 'production' && !process.env.METRICS_ENABLED) {
      return new NextResponse('Not Found', { status: 404 });
    }
    
    if (process.env.METRICS_BASIC === '1' && !verifyBasicAuth(request)) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Metrics"' }
      });
    }
  }

  // Preserve cookie-based i18n for all other routes
  const locale = request.cookies.get('locale')?.value || 'tr';
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = { 
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/metrics', '/((?!_next/static|_next/image|favicon.ico).*)'] 
};