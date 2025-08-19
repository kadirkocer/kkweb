'use client'

import * as React from 'react'
import { Play, Music, MessageCircle, Camera, Hash, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EmbedItem } from '@/site.config'

interface EmbedCardProps {
  embed: EmbedItem
  className?: string
  showPrivacyToggle?: boolean
}

const providerConfig = {
  youtube: {
    name: 'YouTube',
    icon: Play,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    embedUrl: (url: string) => {
      const videoId = extractYouTubeId(url)
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : null
    }
  },
  spotify: {
    name: 'Spotify',
    icon: Music,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    embedUrl: (url: string) => {
      const spotifyId = extractSpotifyId(url)
      const type = extractSpotifyType(url)
      return spotifyId && type ? `https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator&theme=0` : null
    }
  },
  x: {
    name: 'X (Twitter)',
    icon: MessageCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    embedUrl: () => null // X embeds require special handling
  },
  instagram: {
    name: 'Instagram',
    icon: Camera,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    embedUrl: () => null // Instagram embeds require special handling
  },
  threads: {
    name: 'Threads',
    icon: Hash,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50 dark:bg-slate-950/20',
    embedUrl: () => null // Threads embeds require special handling
  },
  linkedin: {
    name: 'LinkedIn',
    icon: ExternalLink,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    embedUrl: () => null // LinkedIn embeds require special handling
  }
}

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

function extractSpotifyId(url: string): string | null {
  const regex = /spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?(?:track|album|playlist|artist)\/([a-zA-Z0-9]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

function extractSpotifyType(url: string): string | null {
  const regex = /spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?(track|album|playlist|artist)\//
  const match = url.match(regex)
  return match ? match[1] : null
}

function EmbedPreview({ embed, onLoad }: { embed: EmbedItem; onLoad: () => void }) {
  const config = providerConfig[embed.provider]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50',
        config.bgColor
      )}
    >
      <div className="text-center">
        <Icon className={cn('mx-auto mb-3 h-12 w-12', config.color)} aria-hidden="true" />
        <h3 className="mb-2 font-medium text-foreground">
          {embed.title || `${config.name} Content`}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Click to load content from {config.name}
        </p>
        <Button
          onClick={onLoad}
          className="group"
          variant="outline"
          size="sm"
        >
          <Eye className="mr-2 h-4 w-4" />
          Load Content
          <ExternalLink className="ml-2 h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          This will connect to {config.name} and may set cookies
        </p>
      </div>
    </div>
  )
}

function EmbedContent({ embed, onUnload }: { embed: EmbedItem; onUnload: () => void }) {
  const config = providerConfig[embed.provider]
  const embedUrl = config.embedUrl(embed.url)

  if (!embedUrl) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Direct embedding not supported for {config.name}
        </p>
        <Button asChild variant="outline" size="sm">
          <a
            href={embed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            View on {config.name}
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Content loaded from {config.name}
        </span>
        <Button
          onClick={onUnload}
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
        >
          <EyeOff className="h-4 w-4" />
          <span className="sr-only">Hide content</span>
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          className="h-80 w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={embed.title || `${config.name} content`}
        />
      </div>
    </div>
  )
}

export function EmbedCard({ embed, className, showPrivacyToggle = true }: EmbedCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const handleLoad = React.useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleUnload = React.useCallback(() => {
    setIsLoaded(false)
  }, [])

  const config = providerConfig[embed.provider]

  if (!config) {
    console.warn(`Unsupported embed provider: ${embed.provider}`)
    return null
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {embed.title && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <config.icon className={cn('h-5 w-5', config.color)} />
            {embed.title}
          </CardTitle>
          <CardDescription>
            From {config.name}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={embed.title ? 'pt-0' : undefined}>
        {!isLoaded || !showPrivacyToggle ? (
          <EmbedPreview embed={embed} onLoad={handleLoad} />
        ) : (
          <EmbedContent embed={embed} onUnload={handleUnload} />
        )}
      </CardContent>
    </Card>
  )
}

// Pre-configured components for specific providers
export function YouTubeEmbed({ url, title, className }: { url: string; title?: string; className?: string }) {
  return (
    <EmbedCard
      embed={{ provider: 'youtube', url, title }}
      className={className}
    />
  )
}

export function SpotifyEmbed({ url, title, className }: { url: string; title?: string; className?: string }) {
  return (
    <EmbedCard
      embed={{ provider: 'spotify', url, title }}
      className={className}
    />
  )
}

export function XEmbed({ url, className }: { url: string; className?: string }) {
  return (
    <EmbedCard
      embed={{ provider: 'x', url }}
      className={className}
    />
  )
}

export function InstagramEmbed({ url, className }: { url: string; className?: string }) {
  return (
    <EmbedCard
      embed={{ provider: 'instagram', url }}
      className={className}
    />
  )
}

export function ThreadsEmbed({ url, className }: { url: string; className?: string }) {
  return (
    <EmbedCard
      embed={{ provider: 'threads', url }}
      className={className}
    />
  )
}