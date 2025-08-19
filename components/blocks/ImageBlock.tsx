import Image from 'next/image'
import { ImageBlockProps } from '@/components/admin/builder/BlockRegistry'
import { cn } from '@/lib/utils'

interface ImageBlockComponentProps {
  data: ImageBlockProps
  preview?: boolean
}

export function ImageBlock({ data, preview = false }: ImageBlockComponentProps) {
  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-2xl',
    circle: 'rounded-full aspect-square object-cover'
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <figure className="text-center">
          <div className="relative inline-block">
            <Image
              src={data.src}
              alt={data.alt}
              width={data.width || 800}
              height={data.height || 600}
              className={cn(
                'max-w-full h-auto',
                variantClasses[data.variant]
              )}
              priority={false}
            />
          </div>
          {data.caption && (
            <figcaption className="mt-4 text-sm text-muted-foreground">
              {data.caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  )
}