import { getTranslations } from 'next-intl/server'
import { siteConfig, type Experience } from '@/site.config'
import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { SectionHeading } from '@/components/section-heading'
import { CardGrid } from '@/components/card-grid'
import { EmbedCard } from '@/components/embed-card'
import { Timeline } from '@/components/timeline'
import { SocialIconLink } from '@/components/social-icon-link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'

// Import data
import socialData from '@/data/social.json'
import projectsData from '@/data/projects.json'
import experienceData from '@/data/experience.json'
import embedsData from '@/data/embeds.json'

// Dynamic imports for MDX content
const AboutTr = () => import('@/content/tr/about.mdx')
const AboutEn = () => import('@/content/en/about.mdx')

// ContactForm component
function ContactForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Get in Touch</CardTitle>
        <CardDescription>
          Send me a message and I'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Button asChild size="lg">
            <Link href={`mailto:${siteConfig.contactEmail}`}>
              Send Email
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Skills data
const skills = [
  'Competition Law',
  'Legal Research', 
  'Python',
  'FastAPI',
  'React',
  'Next.js',
  'Tailwind CSS',
  'AI/ML',
  'RAG Systems',
  'Content Creation'
]

export default async function HomePage() {
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')

  const nav = [
    { href: '#about', label: t('about.title') },
    { href: '#experience', label: t('experience.title') },
    { href: '#projects', label: t('projects.title') },
    { href: '#embeds', label: t('embeds.title') },
    { href: '#contact', label: t('contact.title') }
  ]

  // Project cards
  const projectCards = projectsData.map((project, index) => (
    <Card key={index} className="h-full">
      <CardHeader>
        <CardTitle className="line-clamp-1">{project.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {project.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {project.stack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {project.href && (
            <Button asChild size="sm">
              <Link href={project.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('projects.viewProject')}
              </Link>
            </Button>
          )}
          {project.repo && (
            <Button asChild variant="outline" size="sm">
              <Link href={project.repo} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                {t('projects.viewCode')}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  ))

  const embedCards = embedsData.map((embed, index) => (
    <EmbedCard
      key={index}
      embed={embed as any}
    />
  ))

  return (
    <>
      <Header 
        title={siteConfig.name}
        nav={nav}
      />

      <main id="main" className="min-h-screen">
        {/* Hero Section */}
        <Hero
          name={tCommon('name')}
          tagline={tCommon('tagline')}
          avatarUrl="/avatar.jpg"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20">
          {/* Quick Links */}
          <section>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="outline" className="box-mark border-gold text-gold hover:bg-gold hover:text-court-black">
                <Link href="/interactive">
                  🎮 Interactive Experience
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href={`mailto:${siteConfig.contactEmail}`}>
                  {tCommon('email')}
                </Link>
              </Button>
              {socialData.slice(0, 3).map((social) => (
                <SocialIconLink
                  key={social.platform}
                  social={social}
                  showLabel={true}
                />
              ))}
            </div>
          </section>

          {/* About Section */}
          <section id="about">
            <SectionHeading>{t('about.title')}</SectionHeading>
            
            <Accordion type="single" collapsible className="mt-8">
              <AccordionItem value="about">
                <AccordionTrigger className="text-left">
                  {t('about.readMore')}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p>Law student passionate about AI applications in legal technology. 
                    Currently working on competition law research while building tools 
                    that make legal processes more efficient and accessible.</p>
                    
                    <p>I create content about legal tech, AI developments, and share 
                    insights from my journey as a law student in the digital age.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">{t('skills.title')}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* Experience Section */}
          <section id="experience">
            <SectionHeading>{t('experience.title')}</SectionHeading>
            <Timeline
              items={experienceData as Experience[]}
            />
          </section>

          {/* Projects Section */}
          <section id="projects">
            <SectionHeading>{t('projects.title')}</SectionHeading>
            <CardGrid>{projectCards}</CardGrid>
          </section>

          {/* Embeds Section */}
          <section id="embeds">
            <SectionHeading>{t('embeds.title')}</SectionHeading>
            <CardGrid>{embedCards}</CardGrid>
          </section>

          <Separator />

          {/* Contact Section */}
          <section id="contact">
            <SectionHeading>{t('contact.title')}</SectionHeading>
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Let's connect!</h3>
                    <p className="text-muted-foreground mb-6">
                      Feel free to reach out for collaborations, questions, or just to say hello.
                    </p>
                  </div>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`mailto:${siteConfig.contactEmail}`}>
                      {siteConfig.contactEmail}
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    {socialData.slice(0, 4).map((social) => (
                      <SocialIconLink
                        key={social.platform}
                        social={social}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <ContactForm />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}