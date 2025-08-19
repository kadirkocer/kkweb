// Export all block components
export { HeroBlock } from './HeroBlock'
export { MarkdownBlock } from './MarkdownBlock'
export { ImageBlock } from './ImageBlock'
export { SpacerBlock } from './SpacerBlock'
export { CtaBlock } from './CtaBlock'

// Register blocks
import { registerBlock, blockSchemas, defaultProps } from '@/components/admin/builder/BlockRegistry'
import { HeroBlock } from './HeroBlock'
import { MarkdownBlock } from './MarkdownBlock'
import { ImageBlock } from './ImageBlock'
import { SpacerBlock } from './SpacerBlock'
import { CtaBlock } from './CtaBlock'

// Register Hero Block
registerBlock({
  id: 'hero',
  name: 'Hero Section',
  description: 'A prominent header section with title, subtitle, and call-to-action buttons',
  icon: 'Zap',
  category: 'content',
  schema: blockSchemas.hero,
  defaultProps: defaultProps.hero,
  component: HeroBlock,
})

// Register Markdown Block
registerBlock({
  id: 'markdown',
  name: 'Markdown Content',
  description: 'Rich text content with markdown formatting',
  icon: 'FileText',
  category: 'content',
  schema: blockSchemas.markdown,
  defaultProps: defaultProps.markdown,
  component: MarkdownBlock,
})

// Register Image Block
registerBlock({
  id: 'image',
  name: 'Image',
  description: 'Responsive image with optional caption',
  icon: 'Image',
  category: 'media',
  schema: blockSchemas.image,
  defaultProps: defaultProps.image,
  component: ImageBlock,
})

// Register Spacer Block
registerBlock({
  id: 'spacer',
  name: 'Spacer',
  description: 'Add vertical spacing between sections',
  icon: 'Minus',
  category: 'layout',
  schema: blockSchemas.spacer,
  defaultProps: defaultProps.spacer,
  component: SpacerBlock,
})

// Register CTA Block
registerBlock({
  id: 'cta',
  name: 'Call to Action',
  description: 'Prominent call-to-action section with buttons',
  icon: 'MousePointer',
  category: 'interactive',
  schema: blockSchemas.cta,
  defaultProps: defaultProps.cta,
  component: CtaBlock,
})