import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  children: React.ReactNode
  /**
   * The HTML heading level (h1, h2, h3, etc.)
   * @default "h2"
   */
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /**
   * Visual size variant, independent of semantic level
   * @default matches level
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /**
   * Optional subtitle or description
   */
  subtitle?: string
  /**
   * Alignment of the heading
   * @default "left"
   */
  align?: 'left' | 'center' | 'right'
  /**
   * Whether to show a decorative underline
   * @default false
   */
  underline?: boolean
  /**
   * Custom icon to display before the heading
   */
  icon?: React.ReactNode
  /**
   * Additional content to display after the heading (e.g., actions, badges)
   */
  actions?: React.ReactNode
  className?: string
  id?: string
}

const sizeClasses = {
  xs: 'text-lg font-semibold',
  sm: 'text-xl font-semibold',
  md: 'text-2xl font-bold',
  lg: 'text-3xl font-bold',
  xl: 'text-4xl font-bold',
  '2xl': 'text-5xl font-bold'
}

const defaultSizeForLevel = {
  h1: '2xl',
  h2: 'xl',
  h3: 'lg',
  h4: 'md',
  h5: 'sm',
  h6: 'xs'
} as const

export function SectionHeading({
  children,
  level = 'h2',
  size,
  subtitle,
  align = 'left',
  underline = false,
  icon,
  actions,
  className,
  id,
  ...props
}: SectionHeadingProps & React.HTMLAttributes<HTMLElement>) {
  const Component = level
  const actualSize = size || defaultSizeForLevel[level]
  const headingId = id || (typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : undefined)

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <div
      className={cn(
        'space-y-2',
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {/* Main heading with optional icon and actions */}
      <div className={cn(
        'flex items-center gap-3',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        actions && 'justify-between'
      )}>
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="flex-shrink-0 text-primary" aria-hidden="true">
              {icon}
            </div>
          )}
          <Component
            id={headingId}
            className={cn(
              sizeClasses[actualSize],
              'text-foreground tracking-tight min-w-0',
              underline && 'relative',
              !actions && align === 'center' && 'text-center',
              !actions && align === 'right' && 'text-right'
            )}
          >
            {children}
            {underline && (
              <div className={cn(
                'absolute -bottom-1 h-0.5 bg-primary',
                align === 'center' && 'left-1/2 w-12 -translate-x-1/2',
                align === 'left' && 'left-0 w-12',
                align === 'right' && 'right-0 w-12'
              )} />
            )}
          </Component>
        </div>

        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional subtitle */}
      {subtitle && (
        <p className={cn(
          'text-muted-foreground max-w-2xl',
          actualSize === '2xl' && 'text-xl',
          actualSize === 'xl' && 'text-lg',
          actualSize === 'lg' && 'text-base',
          ['md', 'sm', 'xs'].includes(actualSize) && 'text-sm',
          align === 'center' && 'mx-auto text-center',
          align === 'right' && 'ml-auto text-right'
        )}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// Preset components for common heading patterns
interface PageHeadingProps extends Omit<SectionHeadingProps, 'level' | 'size'> {
  size?: 'lg' | 'xl' | '2xl'
}

export function PageHeading({ size = '2xl', underline = true, ...props }: PageHeadingProps) {
  return (
    <SectionHeading
      level="h1"
      size={size}
      underline={underline}
      {...props}
    />
  )
}

interface SectionTitleProps extends Omit<SectionHeadingProps, 'level' | 'size'> {
  size?: 'md' | 'lg' | 'xl'
}

export function SectionTitle({ size = 'xl', ...props }: SectionTitleProps) {
  return (
    <SectionHeading
      level="h2"
      size={size}
      {...props}
    />
  )
}

interface SubsectionHeadingProps extends Omit<SectionHeadingProps, 'level' | 'size'> {
  size?: 'sm' | 'md' | 'lg'
}

export function SubsectionHeading({ size = 'lg', ...props }: SubsectionHeadingProps) {
  return (
    <SectionHeading
      level="h3"
      size={size}
      {...props}
    />
  )
}

// Specialized heading for cards and smaller components
interface CardHeadingProps extends Omit<SectionHeadingProps, 'level' | 'size' | 'align'> {
  size?: 'xs' | 'sm' | 'md'
}

export function CardHeading({ size = 'md', ...props }: CardHeadingProps) {
  return (
    <SectionHeading
      level="h3"
      size={size}
      align="left"
      {...props}
    />
  )
}

// Utility component for headings with counts or badges
interface HeadingWithCountProps extends SectionHeadingProps {
  count?: number
  badge?: React.ReactNode
}

export function HeadingWithCount({ 
  children, 
  count, 
  badge,
  actions,
  ...props 
}: HeadingWithCountProps) {
  const countOrBadge = count !== undefined ? (
    <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-medium bg-muted text-muted-foreground rounded-full">
      {count}
    </span>
  ) : badge

  const combinedActions = (
    <div className="flex items-center gap-2">
      {countOrBadge}
      {actions}
    </div>
  )

  return (
    <SectionHeading
      actions={combinedActions}
      {...props}
    >
      {children}
    </SectionHeading>
  )
}