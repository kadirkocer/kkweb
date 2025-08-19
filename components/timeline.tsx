import * as React from 'react'
import { MapPin, Calendar, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Experience } from '@/site.config'

interface TimelineProps {
  items: Experience[]
  className?: string
}

interface TimelineItemProps {
  item: Experience
  isLast: boolean
  className?: string
}

function TimelineItem({ item, isLast, className }: TimelineItemProps) {
  return (
    <div className={cn('relative flex gap-6 pb-8', !isLast && 'border-l border-border ml-6', className)}>
      {/* Timeline dot and line */}
      <div className="absolute -left-6 top-2 flex h-4 w-4 items-center justify-center">
        <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
        <div className="absolute h-2 w-2 rounded-full bg-primary" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-3">
        {/* Header with role and organization */}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {item.role}
          </h3>
          {item.organization && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{item.organization}</span>
            </div>
          )}
        </div>

        {/* Period and mode */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {item.period && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{item.period}</span>
            </div>
          )}
          {item.mode && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <Badge variant="secondary" className="text-xs">
                {item.mode}
              </Badge>
            </div>
          )}
        </div>

        {/* Highlights */}
        {item.highlights && item.highlights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Key highlights:</h4>
            <ul className="space-y-1">
              {item.highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                  <span className="flex-1">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function Timeline({ items, className }: TimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">No experience items to display.</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} role="list" aria-label="Timeline of experience">
      {items.map((item, index) => (
        <div key={index} role="listitem">
          <TimelineItem
            item={item}
            isLast={index === items.length - 1}
          />
        </div>
      ))}
    </div>
  )
}

// Alternative compact timeline for smaller spaces
interface CompactTimelineProps {
  items: Experience[]
  className?: string
  maxItems?: number
}

export function CompactTimeline({ items, className, maxItems }: CompactTimelineProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-muted-foreground">No experience items to display.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)} role="list" aria-label="Compact timeline of experience">
      {displayItems.map((item, index) => (
        <div
          key={index}
          role="listitem"
          className="relative flex gap-4 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/50"
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h3 className="font-medium text-foreground line-clamp-1">
                {item.role}
              </h3>
              {item.period && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {item.period}
                </span>
              )}
            </div>

            {item.organization && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {item.organization}
                {item.mode && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.mode}
                  </Badge>
                )}
              </p>
            )}

            {item.highlights && item.highlights.length > 0 && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.highlights.join(' • ')}
              </p>
            )}
          </div>
        </div>
      ))}

      {maxItems && items.length > maxItems && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            And {items.length - maxItems} more...
          </p>
        </div>
      )}
    </div>
  )
}

// Horizontal timeline variant for mobile-friendly display
interface HorizontalTimelineProps {
  items: Experience[]
  className?: string
}

export function HorizontalTimeline({ items, className }: HorizontalTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-muted-foreground">No experience items to display.</p>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto pb-4', className)}>
      <div className="flex gap-4 min-w-max" role="list" aria-label="Horizontal timeline of experience">
        {items.map((item, index) => (
          <div
            key={index}
            role="listitem"
            className="relative flex-shrink-0 w-64 rounded-lg border bg-card p-4 text-card-foreground"
          >
            {/* Connector line */}
            {index < items.length - 1 && (
              <div className="absolute -right-2 top-1/2 h-px w-4 bg-border" />
            )}

            {/* Content */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="font-medium text-foreground line-clamp-2">
                  {item.role}
                </h3>
                {item.organization && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {item.organization}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {item.period && (
                  <Badge variant="outline" className="text-xs">
                    {item.period}
                  </Badge>
                )}
                {item.mode && (
                  <Badge variant="secondary" className="text-xs">
                    {item.mode}
                  </Badge>
                )}
              </div>

              {item.highlights && item.highlights.length > 0 && (
                <div className="space-y-1">
                  <ul className="space-y-1">
                    {item.highlights.slice(0, 3).map((highlight, highlightIndex) => (
                      <li
                        key={highlightIndex}
                        className="flex items-start gap-1 text-xs text-muted-foreground"
                      >
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                        <span className="line-clamp-2">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  {item.highlights.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{item.highlights.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}