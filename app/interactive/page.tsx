import { InteractiveContent } from './InteractiveContent'

export const metadata = {
  title: 'Kadir Koçer - Interactive Portfolio',
  description: 'An interactive side-scrolling portfolio experience blending court, street, and pixel art aesthetics',
  keywords: ['portfolio', 'interactive', 'legal tech', 'developer', 'pixel art'],
  openGraph: {
    title: 'Kadir Koçer - Interactive Portfolio',
    description: 'Court × Street × Pixel - An immersive portfolio experience',
    type: 'website',
    images: [{
      url: '/api/og?title=Interactive+Portfolio&theme=court-street-pixel',
      width: 1200,
      height: 630,
      alt: 'Kadir Koçer Interactive Portfolio'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kadir Koçer - Interactive Portfolio', 
    description: 'Court × Street × Pixel - An immersive portfolio experience'
  }
}

export default function InteractivePage() {
  return (
    <>
      {/* Preload critical font */}
      <link
        rel="preload"
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        as="style"
      />

      <InteractiveContent />

      {/* Accessibility: Alternative navigation for screen readers */}
      <div className="sr-only">
        <nav aria-label="Portfolio sections">
          <h1>Kadir Koçer - Interactive Portfolio</h1>
          <p>Navigate through my professional journey:</p>
          <ul>
            <li><a href="#intro">Introduction - About me and my background</a></li>
            <li><a href="#skills">Skills - Technical expertise and tools</a></li>
            <li><a href="#experience">Experience - Professional timeline</a></li>
            <li><a href="#awards">Awards - Achievements and recognition</a></li>
            <li><a href="#work">Work - Projects and contributions</a></li>
            <li><a href="#contact">Contact - Get in touch</a></li>
          </ul>
        </nav>
      </div>

      {/* Meta tags for SEO and social sharing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Kadir Koçer',
            jobTitle: 'Software Engineer & Legal Tech Specialist',
            description: 'Interactive portfolio showcasing expertise in full-stack development and legal technology',
            url: process.env.NEXT_PUBLIC_SITE_URL + '/interactive',
            image: process.env.NEXT_PUBLIC_SITE_URL + '/avatar.jpg',
            sameAs: [
              'https://linkedin.com/in/kadirkocer',
              'https://github.com/kadirkocer'
            ]
          })
        }}
      />
    </>
  )
}