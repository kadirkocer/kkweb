import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStorage, createStorageError } from '@/lib/storage';

const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  period: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  current: z.boolean().default(false)
});

const experiencesSchema = z.array(experienceSchema);

export async function GET() {
  try {
    const storage = getStorage();
    const experience = await storage.get('experience');
    return NextResponse.json(experience);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('read', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to read experience' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const newExperience = experienceSchema.parse(body);
    
    const experience = await storage.get('experience') as any[];
    experience.push(newExperience);
    await storage.set('experience', experience);
    
    return NextResponse.json(newExperience);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const updatedExperience = experiencesSchema.parse(body);
    
    await storage.set('experience', updatedExperience);
    
    return NextResponse.json(updatedExperience);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}