'use client'

import * as React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Languages, Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface LocaleOption {
  code: string
  name: string
  nativeName: string
  flag?: string
}

const locales: LocaleOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷'
  }
]

interface LocaleSwitchProps {
  className?: string
  variant?: 'default' | 'compact' | 'icon'
  showMobileSheet?: boolean
}

export function LocaleSwitch({ 
  className, 
  variant = 'default',
  showMobileSheet = true 
}: LocaleSwitchProps) {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const currentLocale = locales.find(l => l.code === locale) || locales[0]

  const handleLocaleChange = React.useCallback((newLocale: string) => {
    // Set the locale cookie and refresh the current page
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    router.refresh()
    setIsOpen(false)
  }, [router])

  const LocaleButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button> & { locale: LocaleOption; isActive: boolean }
  >(({ locale: localeOption, isActive, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant={isActive ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 h-12',
        isActive && 'bg-primary text-primary-foreground',
        className
      )}
      onClick={() => handleLocaleChange(localeOption.code)}
      {...props}
    >
      <span className="text-lg" role="img" aria-label={localeOption.name}>
        {localeOption.flag}
      </span>
      <div className="flex flex-col items-start text-left">
        <span className="font-medium">{localeOption.nativeName}</span>
        <span className={cn(
          'text-xs',
          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
        )}>
          {localeOption.name}
        </span>
      </div>
      {isActive && (
        <Check className="ml-auto h-4 w-4" />
      )}
    </Button>
  ))
  LocaleButton.displayName = 'LocaleButton'

  if (variant === 'icon') {
    return (
      <div className={className}>
        {/* Desktop: Simple dropdown-style buttons */}
        <div className="hidden md:flex items-center gap-1">
          {locales.map((localeOption) => {
            const isActive = localeOption.code === locale
            return (
              <Button
                key={localeOption.code}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleLocaleChange(localeOption.code)}
                title={`Switch to ${localeOption.name}`}
              >
                <span role="img" aria-label={localeOption.name}>
                  {localeOption.flag}
                </span>
                <span className="sr-only">{localeOption.name}</span>
              </Button>
            )
          })}
        </div>

        {/* Mobile: Sheet */}
        {showMobileSheet && (
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">{t('language')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[50vh]">
                <SheetHeader className="pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    {t('language')}
                  </SheetTitle>
                  <SheetDescription>
                    Choose your preferred language
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-2">
                  {locales.map((localeOption) => (
                    <LocaleButton
                      key={localeOption.code}
                      locale={localeOption}
                      isActive={localeOption.code === locale}
                    />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={className}>
        {/* Desktop: Compact button with current locale */}
        <div className="hidden md:block">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span role="img" aria-label={currentLocale.name}>
                  {currentLocale.flag}
                </span>
                <span className="hidden sm:inline">{currentLocale.nativeName}</span>
                <Languages className="h-3 w-3" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="pb-4">
                <SheetTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  {t('language')}
                </SheetTitle>
                <SheetDescription>
                  Choose your preferred language
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-2">
                {locales.map((localeOption) => (
                  <LocaleButton
                    key={localeOption.code}
                    locale={localeOption}
                    isActive={localeOption.code === locale}
                  />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile: Sheet from bottom */}
        {showMobileSheet && (
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span role="img" aria-label={currentLocale.name}>
                    {currentLocale.flag}
                  </span>
                  <Languages className="h-3 w-3" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[50vh]">
                <SheetHeader className="pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    {t('language')}
                  </SheetTitle>
                  <SheetDescription>
                    Choose your preferred language
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-2">
                  {locales.map((localeOption) => (
                    <LocaleButton
                      key={localeOption.code}
                      locale={localeOption}
                      isActive={localeOption.code === locale}
                    />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">{t('language')}</span>
            <span className="sm:hidden" role="img" aria-label={currentLocale.name}>
              {currentLocale.flag}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side={showMobileSheet ? 'bottom' : 'right'} 
          className={cn(
            showMobileSheet ? 'max-h-[50vh] md:max-h-none md:w-80' : 'w-80'
          )}
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('language')}
            </SheetTitle>
            <SheetDescription>
              Choose your preferred language
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2">
            {locales.map((localeOption) => (
              <LocaleButton
                key={localeOption.code}
                locale={localeOption}
                isActive={localeOption.code === locale}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Export individual locale options for external use
export { locales }
export type { LocaleOption }