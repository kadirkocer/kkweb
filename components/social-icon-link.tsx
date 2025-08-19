import * as React from 'react'
import { 
  Github, 
  Linkedin, 
  Mail, 
  Globe, 
  Youtube, 
  Instagram,
  MessageCircle,
  Hash,
  Music,
  ExternalLink,
  LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Social } from '@/site.config'

interface SocialIconLinkProps {
  social: Social
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost' | 'colorful'
  showLabel?: boolean
  showTooltip?: boolean
}

// Icon mapping for different social platforms
const platformIcons: { [key: string]: LucideIcon } = {
  github: Github,
  linkedin: Linkedin,
  x: MessageCircle, // Using MessageCircle for X/Twitter
  twitter: MessageCircle,
  instagram: Instagram,
  youtube: Youtube,
  spotify: Music,
  threads: Hash,
  email: Mail,
  website: Globe,
  portfolio: Globe,
  blog: Globe,
}

// Color schemes for platforms (used in colorful variant)
const platformColors: { [key: string]: string } = {
  github: 'hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900',
  linkedin: 'hover:bg-blue-600 hover:text-white',
  x: 'hover:bg-black hover:text-white',
  twitter: 'hover:bg-blue-400 hover:text-white',
  instagram: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white',
  youtube: 'hover:bg-red-600 hover:text-white',
  spotify: 'hover:bg-green-500 hover:text-white',
  threads: 'hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900',
  email: 'hover:bg-blue-500 hover:text-white',
  website: 'hover:bg-purple-500 hover:text-white',
  portfolio: 'hover:bg-purple-500 hover:text-white',
  blog: 'hover:bg-indigo-500 hover:text-white',
}

function getPlatformKey(platform: string): string {
  return platform.toLowerCase().replace(/\s+/g, '')
}

function getIcon(platform: string): LucideIcon {
  const key = getPlatformKey(platform)
  return platformIcons[key] || ExternalLink
}

function getColorClass(platform: string): string {
  const key = getPlatformKey(platform)
  return platformColors[key] || 'hover:bg-primary hover:text-primary-foreground'
}

function getButtonSize(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return 'h-8 w-8'
    case 'lg':
      return 'h-12 w-12'
    default:
      return 'h-10 w-10'
  }
}

function getIconSize(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return 'h-4 w-4'
    case 'lg':
      return 'h-6 w-6'
    default:
      return 'h-5 w-5'
  }
}

export function SocialIconLink({
  social,
  className,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showTooltip = true,
}: SocialIconLinkProps) {
  const Icon = getIcon(social.platform)
  const colorClass = variant === 'colorful' ? getColorClass(social.platform) : ''
  
  const label = social.handle ? `${social.platform} (@${social.handle})` : social.platform
  const buttonContent = (
    <>
      <Icon className={getIconSize(size)} aria-hidden="true" />
      {showLabel && (
        <span className="ml-2">{social.platform}</span>
      )}
      <span className="sr-only">{label}</span>
    </>
  )

  const buttonElement = (
    <Button
      asChild
      variant={variant === 'colorful' ? 'outline' : variant}
      size="icon"
      className={cn(
        getButtonSize(size),
        showLabel && 'w-auto px-3',
        variant === 'colorful' && 'transition-all duration-200',
        variant === 'colorful' && colorClass,
        className
      )}
    >
      <a
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
      >
        {buttonContent}
      </a>
    </Button>
  )

  if (!showTooltip || showLabel) {
    return buttonElement
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Grid component for displaying multiple social links
interface SocialLinksGridProps {
  socials: Social[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost' | 'colorful'
  showLabels?: boolean
  showTooltips?: boolean
  maxColumns?: number
}

export function SocialLinksGrid({
  socials,
  className,
  size = 'md',
  variant = 'outline',
  showLabels = false,
  showTooltips = true,
  maxColumns = 6,
}: SocialLinksGridProps) {
  if (!socials || socials.length === 0) {
    return null
  }

  const gridCols = Math.min(socials.length, maxColumns)
  
  return (
    <div
      className={cn(
        'grid gap-3',
        showLabels ? 'grid-cols-1 sm:grid-cols-2' : `grid-cols-${Math.min(gridCols, 4)} sm:grid-cols-${Math.min(gridCols, 6)}`,
        className
      )}
    >
      {socials.map((social) => (
        <SocialIconLink
          key={social.url}
          social={social}
          size={size}
          variant={variant}
          showLabel={showLabels}
          showTooltip={showTooltips}
        />
      ))}
    </div>
  )
}

// Horizontal list component for compact display
interface SocialLinksListProps {
  socials: Social[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost' | 'colorful'
  showTooltips?: boolean
  separator?: boolean
}

export function SocialLinksList({
  socials,
  className,
  size = 'sm',
  variant = 'ghost',
  showTooltips = true,
  separator = false,
}: SocialLinksListProps) {
  if (!socials || socials.length === 0) {
    return null
  }

  return (
    <div className={cn('flex items-center flex-wrap gap-2', className)}>
      {socials.map((social, index) => (
        <React.Fragment key={social.url}>
          <SocialIconLink
            social={social}
            size={size}
            variant={variant}
            showTooltip={showTooltips}
          />
          {separator && index < socials.length - 1 && (
            <div className="h-4 w-px bg-border" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Utility function to filter socials by platform
export function filterSocialsByPlatform(socials: Social[], platforms: string[]): Social[] {
  return socials.filter(social => 
    platforms.some(platform => 
      getPlatformKey(social.platform) === getPlatformKey(platform)
    )
  )
}

// Preset component for common social platforms
interface CommonSocialLinksProps {
  socials: Social[]
  className?: string
  variant?: 'grid' | 'list'
  size?: 'sm' | 'md' | 'lg'
  includeWebsite?: boolean
}

export function CommonSocialLinks({
  socials,
  className,
  variant = 'list',
  size = 'sm',
  includeWebsite = false,
}: CommonSocialLinksProps) {
  const commonPlatforms = ['github', 'linkedin', 'x', 'twitter', 'instagram', 'youtube']
  const platforms = includeWebsite ? [...commonPlatforms, 'website', 'portfolio', 'blog'] : commonPlatforms
  
  const filteredSocials = filterSocialsByPlatform(socials, platforms)

  if (filteredSocials.length === 0) {
    return null
  }

  return variant === 'grid' ? (
    <SocialLinksGrid
      socials={filteredSocials}
      className={className}
      size={size}
      variant="colorful"
      maxColumns={4}
    />
  ) : (
    <SocialLinksList
      socials={filteredSocials}
      className={className}
      size={size}
      variant="ghost"
    />
  )
}