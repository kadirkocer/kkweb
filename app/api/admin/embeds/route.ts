import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStorage, createStorageError } from '@/lib/storage';
import { withSecureAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';

const embedSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(['youtube', 'spotify', 'twitter', 'instagram', 'threads']),
  url: z.string().url().max(2000),
  title: z.string().optional().transform(val => val?.substring(0, 200)),
  description: z.string().optional().transform(val => val?.substring(0, 500)),
  thumbnail: z.string().url().optional(),
  visible: z.boolean().default(true)
});

const embedsSchema = z.array(embedSchema).max(100); // Limit array size

// Enhanced error handler with security considerations
function handleError(error: unknown, operation: string) {
  console.error(`Admin embeds ${operation} error:`, error);
  
  if (error instanceof Error && error.message === 'Storage not implemented') {
    return NextResponse.json(
      createStorageError(operation as any, 'Use CONTENT_STORAGE=FILE in development.'),
      { status: 501 }
    );
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }, 
      { status: 400 }
    );
  }
  
  // Don't expose internal errors
  return NextResponse.json(
    { error: `Failed to ${operation} embeds` }, 
    { status: 500 }
  );
}

// Secure GET handler
const secureGET = withSecureAuth(async (request: NextRequest) => {
  try {
    const storage = getStorage();
    const embeds = await storage.get('embeds');
    
    // Add cache control for admin data
    const response = NextResponse.json(embeds);
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('X-Admin-Operation', 'read');
    
    return response;
  } catch (error) {
    return handleError(error, 'read');
  }
});

// Secure POST handler
const securePOST = withSecureAuth(async (request: NextRequest) => {
  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    const storage = getStorage();
    const body = await request.json();
    
    // Additional validation for POST
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const newEmbed = embedSchema.parse(body);
    
    const embeds = await storage.get('embeds') as any[];
    
    // Check for duplicate IDs
    if (embeds.some((embed: any) => embed.id === newEmbed.id)) {
      return NextResponse.json(
        { error: 'Embed with this ID already exists' },
        { status: 409 }
      );
    }
    
    embeds.push(newEmbed);
    await storage.set('embeds', embeds);
    
    const response = NextResponse.json(newEmbed, { status: 201 });
    response.headers.set('X-Admin-Operation', 'create');
    
    return response;
  } catch (error) {
    return handleError(error, 'create');
  }
});

// Secure PUT handler
const securePUT = withSecureAuth(async (request: NextRequest) => {
  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }
    
    const storage = getStorage();
    const body = await request.json();
    
    // Additional validation for PUT
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an array' },
        { status: 400 }
      );
    }
    
    const updatedEmbeds = embedsSchema.parse(body);
    
    // Validate unique IDs
    const ids = updatedEmbeds.map(embed => embed.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      return NextResponse.json(
        { error: 'Duplicate embed IDs found' },
        { status: 400 }
      );
    }
    
    await storage.set('embeds', updatedEmbeds);
    
    const response = NextResponse.json(updatedEmbeds);
    response.headers.set('X-Admin-Operation', 'update');
    
    return response;
  } catch (error) {
    return handleError(error, 'update');
  }
});

// Apply rate limiting to all endpoints
export const GET = withRateLimit(secureGET, 'admin');
export const POST = withRateLimit(securePOST, 'admin');
export const PUT = withRateLimit(securePUT, 'admin');