import { NextRequest, NextResponse } from 'next/server'
import { getStorage, createStorageError } from '@/lib/storage'
import { withSecureAuth } from '@/lib/auth'
import { withRateLimit, getClientIP } from '@/lib/rate-limit'

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

// Secure GET handler
const secureGET = withSecureAuth(async (request: NextRequest) => {
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
    
    const response = NextResponse.json(pageVersions)
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    response.headers.set('X-Admin-Operation', 'read-versions')
    
    return response
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
})

// Secure POST handler
const securePOST = withSecureAuth(async (request: NextRequest) => {
  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }
    
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
      const pages = await storage.get<any[]>('pages') || []
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

      const response = NextResponse.json(restoredPage)
      response.headers.set('X-Admin-Operation', 'restore-version')
      
      return response
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
})

// Apply rate limiting and export
export const GET = withRateLimit(secureGET, 'admin')
export const POST = withRateLimit(securePOST, 'admin')