import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    buildId: process.env.BUILD_ID || 'development',
    storageMode: process.env.CONTENT_STORAGE || 'MEMORY',
    time: new Date().toISOString(),
    env: { 
      metricsEnabled: Boolean(process.env.METRICS_ENABLED), 
      nodeEnv: process.env.NODE_ENV 
    }
  });
}