import { notFound } from 'next/navigation'
import { getStorage } from '@/lib/storage'
import { blockRegistry, type Page, type PageBlock } from '@/components/admin/builder/BlockRegistry'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { siteConfig } from '@/site.config'

// Import block components to ensure they're registered
import '@/components/blocks'

interface PageProps {
  params: {
    slug: string
  }
  searchParams: {
    preview?: string
    draft?: string
  }
}

async function getPageBySlug(slug: string, allowDrafts = false): Promise<Page | null> {
  try {
    const storage = getStorage()
    const pages = await storage.get<Page[]>('pages') || []
    
    const page = pages.find(p => p.slug === slug)
    
    if (!page) return null
    
    // Only return published pages unless previewing
    if (page.status !== 'published' && !allowDrafts) {
      return null
    }
    
    return page
  } catch (error) {
    console.error(`Failed to get page with slug ${slug}:`, error)
    return null
  }
}

function renderBlock(block: PageBlock, preview = false) {
  const blockDef = blockRegistry[block.type]
  
  if (!blockDef) {
    console.warn(`Unknown block type: ${block.type}`)
    return null
  }
  
  // Validate block props
  try {
    const validatedProps = blockDef.schema.parse(block.props)
    const BlockComponent = blockDef.component
    
    return (
      <BlockComponent 
        key={block.id} 
        data={validatedProps} 
        preview={preview}
      />
    )
  } catch (error) {
    console.error(`Invalid props for block ${block.id} (${block.type}):`, error)
    
    // In development, show error, in production, skip block silently
    if (process.env.NODE_ENV === 'development') {
      return (
        <div key={block.id} className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <h4 className="text-red-800 font-semibold">Block Error</h4>
          <p className="text-red-600 text-sm">
            Invalid props for {block.type} block (ID: {block.id})
          </p>
          <details className="mt-2">
            <summary className="text-red-600 text-xs cursor-pointer">Show details</summary>
            <pre className="text-xs mt-1 bg-red-100 p-2 rounded overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      )
    }
    
    return null
  }
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const isDraft = searchParams.draft === '1';
  
  // For draft mode, force dynamic rendering
  if (isDraft) {
    const { unstable_noStore } = await import('next/cache');
    unstable_noStore();
  }
  
  const page = await getPageBySlug(params.slug, isDraft);
  
  if (!page || (!isDraft && page.status !== 'published')) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-court-black">
      {isDraft && (
        <div className="bg-gold text-court-black px-4 py-2 text-center">
          Preview Mode
        </div>
      )}
      
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-display text-ink mb-8">{page.title}</h1>
        <div className="space-y-8">
          {page.blocks.map((block, i) => renderBlock(block, isDraft))}
        </div>
      </main>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const page = await getPageBySlug(params.slug)
  
  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }
  
  return {
    title: page.title,
    description: page.description || siteConfig.description,
    openGraph: {
      title: page.title,
      description: page.description || siteConfig.description,
      type: 'article',
    },
  }
}

// ISR configuration - static generation with revalidation
export const dynamic = 'auto';
export const revalidate = 60;

// Generate static paths for published pages
export async function generateStaticParams() {
  try {
    // Only in dev/build - avoid storage calls in production
    if (process.env.NODE_ENV === 'production' && process.env.CONTENT_STORAGE !== 'FILE') {
      return []
    }
    
    const storage = getStorage()
    const pages = await storage.get<Page[]>('pages') || []
    
    // Only generate static paths for published pages
    const publishedPages = pages.filter(page => page.status === 'published')
    
    return publishedPages.map(page => ({
      slug: page.slug,
    }))
  } catch (error) {
    // Graceful fallback - let dynamic rendering handle it
    console.warn('Failed to generate static params:', error)
    return []
  }
}