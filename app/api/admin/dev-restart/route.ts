import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'NOT_IMPLEMENTED',
    message: 'Server restart operations are not available in production. In development, restart manually or use file watching.',
    code: 'NOT_IMPLEMENTED'
  }, { status: 501 });
}