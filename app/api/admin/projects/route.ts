import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStorage, createStorageError } from '@/lib/storage';

const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  technologies: z.array(z.string()),
  github: z.string().optional(),
  demo: z.string().optional(),
  featured: z.boolean().default(false),
  year: z.number()
});

const projectsSchema = z.array(projectSchema);

export async function GET() {
  try {
    const storage = getStorage();
    const projects = await storage.get('projects');
    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('read', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    console.error('Failed to read projects:', error);
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const newProject = projectSchema.parse(body);
    
    const projects = await storage.get('projects') as any[];
    projects.push(newProject);
    await storage.set('projects', projects);
    
    return NextResponse.json(newProject);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const updatedProjects = projectsSchema.parse(body);
    
    await storage.set('projects', updatedProjects);
    
    return NextResponse.json(updatedProjects);
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      );
    }
    return NextResponse.json({ error: 'Failed to update projects' }, { status: 500 });
  }
}