import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStorage, createStorageError } from '@/lib/storage';

const embedSchema = z.object({
  id: z.string(),
  type: z.enum(['youtube', 'spotify', 'twitter', 'instagram', 'threads']),
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  visible: z.boolean().default(true)
});

const embedsSchema = z.array(embedSchema);

export async function GET() {
  try {
    const storage = getStorage();
    const embeds = await storage.get('embeds');
    return NextResponse.json(embeds);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('read', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to read embeds' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const newEmbed = embedSchema.parse(body);
    
    const embeds = await storage.get('embeds') as any[];
    embeds.push(newEmbed);
    await storage.set('embeds', embeds);
    
    return NextResponse.json(newEmbed);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to create embed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const updatedEmbeds = embedsSchema.parse(body);
    
    await storage.set('embeds', updatedEmbeds);
    
    return NextResponse.json(updatedEmbeds);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to update embeds' }, { status: 500 });
  }
}