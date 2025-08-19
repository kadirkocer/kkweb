import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Minimum width for each card in the grid
   * @default "300px"
   */
  minCardWidth?: string
  /**
   * Gap between grid items
   * @default "1.5rem"
   */
  gap?: string
  /**
   * Number of columns for smaller screens
   * @default 1
   */
  mobileColumns?: number
  /**
   * Maximum number of columns
   * @default undefined (no limit)
   */
  maxColumns?: number
}

export function CardGrid({
  children,
  className,
  minCardWidth = '300px',
  gap = '1.5rem',
  mobileColumns = 1,
  maxColumns,
  style,
  ...props
}: CardGridProps) {
  const gridStyle = React.useMemo(() => {
    const baseStyle: React.CSSProperties = {
      display: 'grid',
      gap,
      ...style
    }

    // For mobile, use explicit columns
    if (mobileColumns) {
      baseStyle.gridTemplateColumns = `repeat(${mobileColumns}, 1fr)`
    }

    return baseStyle
  }, [gap, mobileColumns, style])

  const responsiveClasses = React.useMemo(() => {
    const classes = []

    // For tablet and up, use auto-fit with min width
    if (maxColumns) {
      classes.push(`sm:grid-cols-[repeat(auto-fit,minmax(${minCardWidth},1fr))]`)
      classes.push(`sm:max-w-[${maxColumns * 320}px]`) // Approximate max width
    } else {
      classes.push(`sm:grid-cols-[repeat(auto-fit,minmax(${minCardWidth},1fr))]`)
    }

    return classes.join(' ')
  }, [minCardWidth, maxColumns])

  return (
    <div
      className={cn(
        'grid w-full',
        responsiveClasses,
        className
      )}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  )
}

// Utility component for responsive card grids with common presets
interface ResponsiveCardGridProps extends Omit<CardGridProps, 'minCardWidth' | 'maxColumns'> {
  variant?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveCardGrid({
  variant = 'md',
  className,
  ...props
}: ResponsiveCardGridProps) {
  const variants = {
    sm: { minCardWidth: '250px', maxColumns: 4 },
    md: { minCardWidth: '300px', maxColumns: 3 },
    lg: { minCardWidth: '350px', maxColumns: 3 },
    xl: { minCardWidth: '400px', maxColumns: 2 }
  }

  const config = variants[variant]

  return (
    <CardGrid
      className={cn('mx-auto', className)}
      minCardWidth={config.minCardWidth}
      maxColumns={config.maxColumns}
      {...props}
    />
  )
}

// Pre-built grid layouts for common use cases
export function ProjectGrid({ children, className, ...props }: Omit<CardGridProps, 'minCardWidth' | 'maxColumns'>) {
  return (
    <CardGrid
      className={cn('mx-auto max-w-6xl', className)}
      minCardWidth="320px"
      maxColumns={3}
      mobileColumns={1}
      {...props}
    >
      {children}
    </CardGrid>
  )
}

export function SkillGrid({ children, className, ...props }: Omit<CardGridProps, 'minCardWidth' | 'maxColumns'>) {
  return (
    <CardGrid
      className={cn('mx-auto max-w-4xl', className)}
      minCardWidth="200px"
      maxColumns={4}
      mobileColumns={2}
      gap="1rem"
      {...props}
    >
      {children}
    </CardGrid>
  )
}

export function ContentGrid({ children, className, ...props }: Omit<CardGridProps, 'minCardWidth' | 'maxColumns'>) {
  return (
    <CardGrid
      className={cn('mx-auto max-w-5xl', className)}
      minCardWidth="280px"
      maxColumns={3}
      mobileColumns={1}
      {...props}
    >
      {children}
    </CardGrid>
  )
}