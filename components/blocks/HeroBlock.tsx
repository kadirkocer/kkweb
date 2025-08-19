import { Button } from '@/components/ui/button'
import { HeroBlockProps } from '@/components/admin/builder/BlockRegistry'
import { ArrowRight, Download } from 'lucide-react'

interface HeroBlockComponentProps {
  data: HeroBlockProps
  preview?: boolean
}

export function HeroBlock({ data, preview = false }: HeroBlockComponentProps) {
  return (
    <section
      className="relative flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
      style={data.backgroundImage ? {
        backgroundImage: `url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {data.backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      
      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          {data.title}
        </h1>
        
        {data.subtitle && (
          <p className="mb-12 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            {data.subtitle}
          </p>
        )}
        
        {(data.primaryCta || data.secondaryCta) && (
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {data.primaryCta && (
              <Button size="lg" className="h-12 px-8 text-base font-medium" asChild>
                <a href={preview ? '#' : data.primaryCta.href} className="flex items-center gap-2">
                  {data.primaryCta.text}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            {data.secondaryCta && (
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium" asChild>
                <a href={preview ? '#' : data.secondaryCta.href} className="flex items-center gap-2">
                  {data.secondaryCta.text}
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )}
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </div>
    </section>
  )
}