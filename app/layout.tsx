import { Inter, JetBrains_Mono } from 'next/font/google'
import { siteConfig } from '@/site.config'
import '@/styles/globals.css'
import { Providers } from './providers'
import { cookies } from 'next/headers'
import { Locale } from '@/i18n'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: ['law student', 'AI', 'software', 'competition law', 'content creator'],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const locale = (cookieStore.get('locale')?.value as Locale) || 'tr'
  
  // Dynamically import messages
  const messages = (await import(`../messages/${locale}.json`)).default

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0B0F14" />
        <meta name="color-scheme" content="dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
        
        {siteConfig.plausibleDomain && (
          <script
            defer
            data-domain={siteConfig.plausibleDomain}
            src="https://plausible.io/js/plausible.js"
          />
        )}
      </body>
    </html>
  )
}