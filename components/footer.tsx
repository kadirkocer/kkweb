import { useTranslations } from 'next-intl'
import { SocialIconLink } from '@/components/social-icon-link'
import { siteConfig } from '@/site.config'

export function Footer() {
  const t = useTranslations('common')

  return (
    <footer className="border-t bg-card/50 no-print">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 {t('name')}. Made with Next.js.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {siteConfig.socials.slice(0, 4).map((social) => (
              <SocialIconLink
                key={social.platform}
                social={social}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}