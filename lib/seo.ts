import { Metadata } from 'next'
import { siteConfig } from '@/site.config'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  locale?: string
}

export function generateSEO({
  title,
  description = siteConfig.description,
  image = '/api/og',
  url = '/',
  type = 'website',
  locale = 'tr_TR'
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.title
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const fullUrl = new URL(url, siteUrl).toString()
  const fullImage = new URL(image, siteUrl).toString()

  return {
    title: fullTitle,
    description,
    keywords: ['law student', 'AI', 'software', 'competition law', 'content creator', 'fashion'],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'tr': '/tr',
        'en': '/en',
      },
    },
    openGraph: {
      type,
      locale,
      url: fullUrl,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: '@kadir',
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
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  }
}

export function generatePersonJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    jobTitle: 'Law Student',
    description: siteConfig.description,
    url: siteUrl,
    sameAs: siteConfig.socials.map(social => social.url),
    knowsAbout: [
      'Competition Law',
      'Legal Research',
      'Artificial Intelligence',
      'Software Development',
      'Content Creation'
    ],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Law School'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Istanbul',
      addressCountry: 'TR'
    },
    email: siteConfig.contactEmail,
    image: `${siteUrl}/avatar.jpg`
  }
}