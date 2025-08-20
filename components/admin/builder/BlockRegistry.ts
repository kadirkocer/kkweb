import { z } from 'zod'
import { ComponentType } from 'react'

// Block Schema Definitions
export const heroBlockSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  primaryCta: z.object({
    text: z.string(),
    href: z.string(),
  }).optional(),
  secondaryCta: z.object({
    text: z.string(),
    href: z.string(),
  }).optional(),
  backgroundImage: z.string().optional(),
})

export const markdownBlockSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  variant: z.enum(['default', 'prose', 'compact']).default('default'),
})

export const imageBlockSchema = z.object({
  src: z.string().url('Must be a valid URL'),
  alt: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  variant: z.enum(['default', 'rounded', 'circle']).default('default'),
})

export const embedBlockSchema = z.object({
  type: z.enum(['youtube', 'spotify', 'twitter', 'instagram']),
  url: z.string().url('Must be a valid URL'),
  title: z.string().optional(),
  description: z.string().optional(),
})

export const gridBlockSchema = z.object({
  columns: z.number().min(1).max(6).default(2),
  gap: z.enum(['small', 'medium', 'large']).default('medium'),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
  })),
})

export const ctaBlockSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  primaryCta: z.object({
    text: z.string(),
    href: z.string(),
    variant: z.enum(['default', 'outline', 'ghost']).default('default'),
  }),
  secondaryCta: z.object({
    text: z.string(),
    href: z.string(),
    variant: z.enum(['default', 'outline', 'ghost']).default('outline'),
  }).optional(),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
})

export const spacerBlockSchema = z.object({
  height: z.enum(['small', 'medium', 'large', 'xlarge']).default('medium'),
})

// Block Type Definitions
export type HeroBlockProps = z.infer<typeof heroBlockSchema>
export type MarkdownBlockProps = z.infer<typeof markdownBlockSchema>
export type ImageBlockProps = z.infer<typeof imageBlockSchema>
export type EmbedBlockProps = z.infer<typeof embedBlockSchema>
export type GridBlockProps = z.infer<typeof gridBlockSchema>
export type CtaBlockProps = z.infer<typeof ctaBlockSchema>
export type SpacerBlockProps = z.infer<typeof spacerBlockSchema>

export type BlockProps = 
  | HeroBlockProps
  | MarkdownBlockProps
  | ImageBlockProps
  | EmbedBlockProps
  | GridBlockProps
  | CtaBlockProps
  | SpacerBlockProps

// Block Definition Interface
export interface BlockDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: 'content' | 'media' | 'layout' | 'interactive'
  schema: z.ZodSchema<any>
  defaultProps: any
  component: ComponentType<any>
  previewComponent?: ComponentType<any>
}

// Default Props
const defaultProps = {
  hero: {
    title: 'Welcome to Our Site',
    subtitle: 'Discover amazing content and experiences',
    primaryCta: {
      text: 'Get Started',
      href: '#',
    },
  } satisfies HeroBlockProps,
  
  markdown: {
    content: '# Hello World\n\nThis is a markdown block. You can write **bold** text, *italic* text, and more.',
    variant: 'default',
  } satisfies MarkdownBlockProps,
  
  image: {
    src: '/placeholder-image.jpg',
    alt: 'Placeholder image',
    variant: 'default',
  } satisfies ImageBlockProps,
  
  embed: {
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Sample Video',
  } satisfies EmbedBlockProps,
  
  grid: {
    columns: 2,
    gap: 'medium',
    items: [
      {
        id: '1',
        title: 'Item 1',
        description: 'Description for item 1',
      },
      {
        id: '2',
        title: 'Item 2',
        description: 'Description for item 2',
      },
    ],
  } satisfies GridBlockProps,
  
  cta: {
    title: 'Ready to get started?',
    description: 'Join thousands of users who trust our platform.',
    primaryCta: {
      text: 'Get Started',
      href: '#',
      variant: 'default',
    },
    alignment: 'center',
  } satisfies CtaBlockProps,
  
  spacer: {
    height: 'medium',
  } satisfies SpacerBlockProps,
}

// Block Registry - will be populated with actual components
export const blockRegistry: Record<string, BlockDefinition> = {}

// Helper function to register blocks
export function registerBlock(definition: BlockDefinition) {
  blockRegistry[definition.id] = definition
}

// Helper function to get all blocks by category
export function getBlocksByCategory(category: BlockDefinition['category']): BlockDefinition[] {
  return Object.values(blockRegistry).filter(block => block.category === category)
}

// Helper function to validate block props
export function validateBlockProps(blockId: string, props: any): { success: boolean; data?: any; error?: string } {
  const block = blockRegistry[blockId]
  if (!block) {
    return { success: false, error: `Unknown block type: ${blockId}` }
  }
  
  try {
    const validatedProps = block.schema.parse(props)
    return { success: true, data: validatedProps }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Page Block Interface
export interface PageBlock {
  id: string
  type: string
  props: Record<string, any> // Allow any props for flexibility
  order: number
}

// Page Interface
export interface Page {
  id: string
  slug: string
  title: string
  description?: string
  status: 'draft' | 'published'
  blocks: PageBlock[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  version: number
}

// Page Version Interface
export interface PageVersion {
  id: string
  pageId: string
  version: number
  title: string
  blocks: PageBlock[]
  createdAt: string
  publishedAt?: string
  author?: string
}

// Export schemas for API validation
export const blockSchemas = {
  hero: heroBlockSchema,
  markdown: markdownBlockSchema,
  image: imageBlockSchema,
  embed: embedBlockSchema,
  grid: gridBlockSchema,
  cta: ctaBlockSchema,
  spacer: spacerBlockSchema,
}

// Export default props
export { defaultProps }