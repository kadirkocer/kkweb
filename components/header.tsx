'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { LocaleSwitch } from '@/components/locale-switch'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  nav: Array<{ href: string; label: string }>
  showLocaleSwitch?: boolean
}

export function Header({ title, nav, showLocaleSwitch = true }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const t = useTranslations('common')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md'
          : 'bg-background/0'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          {title}
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {showLocaleSwitch && <LocaleSwitch />}
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/resume">{t('cv')}</Link>
          </Button>
        </div>
      </div>

      <a
        href="#main"
        className="skip-to-content"
      >
        Skip to main content
      </a>
    </header>
  )
}