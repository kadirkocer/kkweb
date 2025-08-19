import { Button } from '@/components/ui/button'
import { CtaBlockProps } from '@/components/admin/builder/BlockRegistry'
import { cn } from '@/lib/utils'

interface CtaBlockComponentProps {
  data: CtaBlockProps
  preview?: boolean
}

export function CtaBlock({ data, preview = false }: CtaBlockComponentProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className={cn(
          'rounded-2xl bg-muted/30 p-8 sm:p-12',
          alignmentClasses[data.alignment]
        )}>
          <h2 className="text-3xl font-bold tracking-tight mb-4 sm:text-4xl">
            {data.title}
          </h2>
          
          {data.description && (
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {data.description}
            </p>
          )}
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              variant={data.primaryCta.variant as any}
              className="h-12 px-8 text-base font-medium"
              asChild
            >
              <a href={preview ? '#' : data.primaryCta.href}>
                {data.primaryCta.text}
              </a>
            </Button>
            
            {data.secondaryCta && (
              <Button 
                size="lg" 
                variant={data.secondaryCta.variant as any}
                className="h-12 px-8 text-base font-medium"
                asChild
              >
                <a href={preview ? '#' : data.secondaryCta.href}>
                  {data.secondaryCta.text}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}