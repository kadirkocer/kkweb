import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { getStorage, createStorageError } from '@/lib/storage';
import { validateBasicAuth, createAuthResponse } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { type Page, type PageBlock, type PageVersion } from '@/components/admin/builder/BlockRegistry';

const PageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  blocks: z.array(z.object({ type: z.string(), props: z.record(z.any()) })),
  status: z.enum(['draft', 'published']),
  metadata: z.object({ 
    author: z.string().optional(), 
    publishedAt: z.string().optional(),
    description: z.string().optional()
  }).optional()
});

const updatePageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
  blocks: z.array(z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any()),
    order: z.number()
  }))
});

// Authentication and rate limiting guard
function checkAuth(request: NextRequest) {
  try {
    if (!validateBasicAuth(request)) {
      return createAuthResponse('Admin')
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Configuration error', 
      message: 'ADMIN_USERNAME and ADMIN_PASSWORD must be set',
      requestId: crypto.randomUUID(),
    }, { status: 500 })
  }
  
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(clientIP)) {
    return createRateLimitResponse(60)
  }
  
  return null
}

// Helper function to log errors with context
function logError(error: any, context: any, category: string = 'general') {
  console.error(`[${category}] Error in ${context.path} (${context.method}):`, error)
}

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown'; 
  if (!checkRateLimit(ip)) { 
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter: 1000 }, { status: 429 }); 
  }
  
  const requestId = nanoid();
  try {
    const body = await request.json(); 
    const validated = PageSchema.parse(body); 
    const storage = getStorage();
    
    if (validated.status === 'published') {
      const pages = await storage.get<Page[]>('pages') || []
      const existing = pages.find(p => p.slug === validated.slug)
      if (existing) { 
        const versions = await storage.get<PageVersion[]>('page_versions') || []
        versions.push({
          id: nanoid(),
          pageId: existing.id,
          version: existing.version,
          title: existing.title,
          blocks: existing.blocks,
          createdAt: new Date().toISOString(),
          publishedAt: existing.publishedAt,
          author: validated.metadata?.author || 'system'
        })
        await storage.set('page_versions', versions)
      }
      validated.metadata = { ...validated.metadata, publishedAt: new Date().toISOString() };
    }
    
    const pages = await storage.get<Page[]>('pages') || []
    const pageIndex = pages.findIndex(p => p.slug === validated.slug)
    const newPage: Page = {
      id: pageIndex >= 0 ? pages[pageIndex].id : nanoid(),
      slug: validated.slug,
      title: validated.title,
      description: validated.metadata?.description,
      status: validated.status,
      blocks: validated.blocks.map((block, i) => ({
        id: nanoid(),
        type: block.type,
        props: block.props,
        order: i
      })),
      createdAt: pageIndex >= 0 ? pages[pageIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: validated.metadata?.publishedAt,
      version: pageIndex >= 0 ? pages[pageIndex].version + 1 : 1
    }
    
    if (pageIndex >= 0) {
      pages[pageIndex] = newPage
    } else {
      pages.push(newPage)
    }
    await storage.set('pages', pages)
    
    if (validated.status === 'published') {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, { 
        method: 'POST', 
        headers: { 'x-revalidate-token': process.env.REVALIDATE_TOKEN! }, 
        body: JSON.stringify({ path: `/${validated.slug}` }) 
      });
    }
    
    return NextResponse.json({ success: true, slug: validated.slug, requestId });
  } catch (error) {
    if (error instanceof z.ZodError) { 
      return NextResponse.json({ error: 'Validation failed', details: error.errors, requestId }, { status: 422 }); 
    }
    console.error(`[${requestId}] Error:`, error);
    return NextResponse.json({ error: 'Internal server error', requestId }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = checkAuth(request)
  if (authResult) return authResult
  
  try {
    const storage = getStorage()
    const body = await request.json()
    const validatedPage = updatePageSchema.parse(body)
    
    // Get existing pages
    const pages = await storage.get<Page[]>('pages') || []
    const pageIndex = pages.findIndex(p => p.id === validatedPage.id)
    
    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    const existingPage = pages[pageIndex]
    
    // Check if slug conflicts with another page
    const conflictingPage = pages.find(p => 
      p.slug === validatedPage.slug && p.id !== validatedPage.id
    )
    if (conflictingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      )
    }
    
    // Update page
    const wasPublished = existingPage.status === 'published'
    const isBeingPublished = validatedPage.status === 'published' && !wasPublished
    
    const updatedPage: Page = {
      ...existingPage,
      ...validatedPage,
      updatedAt: new Date().toISOString(),
      publishedAt: isBeingPublished ? new Date().toISOString() : existingPage.publishedAt,
      version: isBeingPublished ? existingPage.version + 1 : existingPage.version,
    }
    
    pages[pageIndex] = updatedPage
    await storage.set('pages', pages)
    
    // Create version snapshot if publishing
    if (isBeingPublished) {
      await createVersionSnapshot(storage, updatedPage)
    }
    
    return NextResponse.json(updatedPage)
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      )
    }
    
    if (error instanceof z.ZodError) {
      logError(error, { path: '/api/admin/pages', method: 'POST' }, 'block-validation')
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
        requestId: crypto.randomUUID(),
      }, { status: 422 })
    }
    
    console.error('Failed to update page:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = checkAuth(request)
  if (authResult) return authResult
  
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')
    
    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }
    
    const storage = getStorage()
    const pages = await storage.get<Page[]>('pages') || []
    const pageIndex = pages.findIndex(p => p.id === pageId)
    
    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    // Remove page
    pages.splice(pageIndex, 1)
    await storage.set('pages', pages)
    
    // TODO: Also clean up versions for this page
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      )
    }
    
    console.error('Failed to delete page:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}

// Helper function to create version snapshots
async function createVersionSnapshot(storage: any, page: Page) {
  try {
    const versions = await storage.get('page_versions') || []
    
    const versionSnapshot = {
      id: crypto.randomUUID(),
      pageId: page.id,
      version: page.version,
      title: page.title,
      blocks: page.blocks,
      createdAt: new Date().toISOString(),
      publishedAt: page.publishedAt,
    }
    
    versions.push(versionSnapshot)
    
    // Keep only last 10 versions per page
    const pageVersions = versions
      .filter((v: any) => v.pageId === page.id)
      .sort((a: any, b: any) => b.version - a.version)
      .slice(0, 10)
    
    const otherVersions = versions.filter((v: any) => v.pageId !== page.id)
    
    await storage.set('page_versions', [...otherVersions, ...pageVersions])
  } catch (error) {
    console.error('Failed to create version snapshot:', error)
    // Don't fail the main operation if versioning fails
  }
}