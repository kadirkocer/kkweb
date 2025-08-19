import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStorage, createStorageError } from '@/lib/storage'
import type { Page, PageBlock } from '@/components/admin/builder/BlockRegistry'

const pageBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.any()),
  order: z.number(),
})

const pageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  blocks: z.array(pageBlockSchema).default([]),
})

const updatePageSchema = pageSchema.extend({
  id: z.string(),
})

export async function GET() {
  try {
    const storage = getStorage()
    const pages = await storage.get<Page[]>('pages') || []
    
    // Return pages sorted by updated date
    const sortedPages = pages.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    
    return NextResponse.json(sortedPages)
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('read', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      )
    }
    console.error('Failed to read pages:', error)
    return NextResponse.json({ error: 'Failed to read pages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage()
    const body = await request.json()
    const validatedPage = pageSchema.parse(body)
    
    // Get existing pages
    const pages = await storage.get<Page[]>('pages') || []
    
    // Check if slug already exists
    const existingPage = pages.find(p => p.slug === validatedPage.slug)
    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      )
    }
    
    // Create new page
    const newPage: Page = {
      id: crypto.randomUUID(),
      ...validatedPage,
      blocks: validatedPage.blocks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: validatedPage.status === 'published' ? new Date().toISOString() : undefined,
      version: 1,
    }
    
    // Add to pages array
    pages.push(newPage)
    await storage.set('pages', pages)
    
    // If publishing, create version snapshot
    if (newPage.status === 'published') {
      await createVersionSnapshot(storage, newPage)
    }
    
    return NextResponse.json(newPage, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      )
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
    
    console.error('Failed to create page:', error)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
    
    console.error('Failed to update page:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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