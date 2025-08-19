import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'NOT_IMPLEMENTED',
    message: 'Build operations are not available in production. Trigger builds via CI/CD (e.g., GitHub Actions webhook).',
    code: 'NOT_IMPLEMENTED'
  }, { status: 501 });
}