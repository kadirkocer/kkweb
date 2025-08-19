import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStorage, createStorageError } from '@/lib/storage';

const socialSchema = z.object({
  id: z.string(),
  platform: z.string(),
  username: z.string(),
  url: z.string(),
  icon: z.string(),
  visible: z.boolean().default(true)
});

const socialsSchema = z.array(socialSchema);

export async function GET() {
  try {
    const storage = getStorage();
    const social = await storage.get('social');
    return NextResponse.json(social);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('read', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to read social links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const newSocial = socialSchema.parse(body);
    
    const social = await storage.get('social') as any[];
    social.push(newSocial);
    await storage.set('social', social);
    
    return NextResponse.json(newSocial);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const updatedSocial = socialsSchema.parse(body);
    
    await storage.set('social', updatedSocial);
    
    return NextResponse.json(updatedSocial);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to update social links' }, { status: 500 });
  }
}