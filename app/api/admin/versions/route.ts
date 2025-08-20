import { NextRequest, NextResponse } from 'next/server'
import { getStorage, createStorageError } from '@/lib/storage'
import { validateBasicAuth, createAuthResponse } from '@/lib/auth'
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit'

interface PageVersion {
  id: string
  pageId: string
  version: number
  title: string
  blocks: any[]
  createdAt: string
  publishedAt?: string
  author?: string
}

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
  
  const rateLimitResult = checkRateLimit(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.retryAfter || 60)
  }
  
  return null
}

export async function GET(request: NextRequest) {
  const authResult = checkAuth(request)
  if (authResult) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')
    
    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    const storage = getStorage()
    const versions = await storage.get<PageVersion[]>('page_versions') || []
    
    // Filter versions for the specific page and sort by version descending
    const pageVersions = versions
      .filter(v => v.pageId === pageId)
      .sort((a, b) => b.version - a.version)
    
    return NextResponse.json(pageVersions)
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('read', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      )
    }
    
    console.error('Failed to fetch versions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch versions',
      requestId: crypto.randomUUID(),
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authResult = checkAuth(request)
  if (authResult) return authResult

  try {
    const body = await request.json()
    const { pageId, action } = body

    if (!pageId || !action) {
      return NextResponse.json(
        { error: 'Page ID and action are required' },
        { status: 400 }
      )
    }

    const storage = getStorage()

    if (action === 'restore') {
      const { versionId } = body
      
      if (!versionId) {
        return NextResponse.json(
          { error: 'Version ID is required for restore action' },
          { status: 400 }
        )
      }

      // Get the version to restore
      const versions = await storage.get<PageVersion[]>('page_versions') || []
      const versionToRestore = versions.find(v => v.id === versionId)
      
      if (!versionToRestore) {
        return NextResponse.json(
          { error: 'Version not found' },
          { status: 404 }
        )
      }

      // Get current pages
      const pages = await storage.get('pages') || []
      const pageIndex = pages.findIndex((p: any) => p.id === pageId)
      
      if (pageIndex === -1) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        )
      }

      // Restore the version content into the current draft
      const currentPage = pages[pageIndex]
      const restoredPage = {
        ...currentPage,
        title: versionToRestore.title,
        blocks: versionToRestore.blocks,
        status: 'draft', // Always restore as draft
        updatedAt: new Date().toISOString(),
        // Don't change version number until it's published again
      }

      pages[pageIndex] = restoredPage
      await storage.set('pages', pages)

      return NextResponse.json(restoredPage)
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Storage not implemented') {
      return NextResponse.json(
        createStorageError('write', 'Use CONTENT_STORAGE=FILE in development.'),
        { status: 501 }
      )
    }
    
    console.error('Failed to process version action:', error)
    return NextResponse.json({ 
      error: 'Failed to process version action',
      requestId: crypto.randomUUID(),
    }, { status: 500 })
  }
}