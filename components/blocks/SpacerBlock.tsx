import { SpacerBlockProps } from '@/components/admin/builder/BlockRegistry'

interface SpacerBlockComponentProps {
  data: SpacerBlockProps
  preview?: boolean
}

export function SpacerBlock({ data, preview = false }: SpacerBlockComponentProps) {
  const heights = {
    small: 'h-8',
    medium: 'h-16',
    large: 'h-32',
    xlarge: 'h-48'
  }

  return (
    <div className={heights[data.height]}>
      {preview && (
        <div className="flex h-full items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <span className="text-sm text-muted-foreground">Spacer ({data.height})</span>
        </div>
      )}
    </div>
  )
}