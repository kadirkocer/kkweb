export type Social = {
  platform: string
  handle?: string
  url: string
}

export type Project = {
  title: string
  stack: string[]
  summary: string
  href?: string
  repo?: string
  image?: string
}

export type Experience = {
  role: string
  organization?: string
  mode?: 'Hybrid' | 'Remote' | 'Onsite'
  period?: string
  highlights: string[]
}

export type EmbedItem = {
  provider: 'youtube' | 'spotify' | 'x' | 'instagram' | 'threads' | 'linkedin'
  url: string
  title?: string
  description?: string
  poster?: string
}

export type SiteConfig = {
  name: string
  title: string
  description: string
  locale: 'tr' | 'en'
  socials: Social[]
  contactEmail: string
  plausibleDomain?: string
}

export const siteConfig: SiteConfig = {
  name: 'Kadir Köçer',
  title: 'Kadir Köçer — Personal Site',
  description: 'Law student • AI & software projects • Content & fashion.',
  locale: 'tr',
  contactEmail: 'kkadirkocer@gmail.com',
  plausibleDomain: process.env.PLAUSIBLE_DOMAIN,
  socials: [
    {
      platform: 'LinkedIn',
      handle: 'kkadirkocer',
      url: 'https://www.linkedin.com/in/kkadirkocer/'
    },
    {
      platform: 'X',
      handle: 'kkadirkocer',
      url: 'https://x.com/kkadirkocer'
    },
    {
      platform: 'Instagram',
      handle: 'kkadirkkocer',
      url: 'https://www.instagram.com/kkadirkkocer'
    },
    {
      platform: 'YouTube',
      handle: 'kkadirkocer',
      url: 'https://www.youtube.com/@kkadirkocer'
    },
    {
      platform: 'GitHub',
      handle: 'kkadirkocer',
      url: 'https://github.com/kkadirkocer'
    }
  ]
}