import { MarkdownBlockProps } from '@/components/admin/builder/BlockRegistry'
import { cn } from '@/lib/utils'

interface MarkdownBlockComponentProps {
  data: MarkdownBlockProps
  preview?: boolean
}

export function MarkdownBlock({ data, preview = false }: MarkdownBlockComponentProps) {
  // Simple markdown parsing for basic formatting
  const parseMarkdown = (content: string) => {
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mb-2">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
  }

  const variantClasses = {
    default: 'max-w-none',
    prose: 'prose prose-lg dark:prose-invert max-w-none',
    compact: 'max-w-2xl text-sm'
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div 
          className={cn(
            'markdown-content',
            variantClasses[data.variant],
            'text-foreground'
          )}
          dangerouslySetInnerHTML={{ 
            __html: `<p class="mb-4">${parseMarkdown(data.content)}</p>` 
          }}
        />
      </div>
    </section>
  )
}