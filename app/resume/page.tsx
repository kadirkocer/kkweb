'use client'

import { useTranslations } from 'next-intl'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SectionHeading } from '@/components/section-heading'
import { CompactTimeline } from '@/components/timeline'
import { SocialIconLink } from '@/components/social-icon-link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Download, Printer, ExternalLink, Github, Mail, Phone, MapPin, Globe } from 'lucide-react'
import Link from 'next/link'
import { siteConfig, type Experience } from '@/site.config'

// Import data
import socialData from '@/data/social.json'
import projectsData from '@/data/projects.json'
import experienceData from '@/data/experience.json'

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

export default function ResumePage() {
  const t = useTranslations('resume')
  const tCommon = useTranslations('common')

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/now', label: 'Now' }
  ]

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={siteConfig.name}
        nav={nav}
      />
      
      <main id="main" className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 no-print">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{tCommon('name')}</h1>
            <p className="text-xl text-muted-foreground mt-2">{siteConfig.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <SectionHeading>About</SectionHeading>
              <p className="text-muted-foreground leading-relaxed">
                Law student passionate about AI applications in legal technology. 
                Currently working on competition law research while building tools 
                that make legal processes more efficient and accessible. I create 
                content about legal tech, AI developments, and share insights from 
                my journey as a law student in the digital age.
              </p>
            </section>

            {/* Experience */}
            <section className="print-break-inside-avoid">
              <SectionHeading>Experience</SectionHeading>
              <Card className="print:border-none print:shadow-none">
                <CardContent className="pt-6">
                  <CompactTimeline
                    items={experienceData as Experience[]}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Projects */}
            <section className="print-break-inside-avoid">
              <SectionHeading>Projects</SectionHeading>
              <div className="space-y-4">
                {projectsData.map((project, index) => (
                  <Card key={index} className="print:border-none print:shadow-none">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <p className="text-muted-foreground text-sm">{project.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.stack.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 no-print">
                          {project.href && (
                            <Button asChild size="sm" variant="outline">
                              <Link href={project.href} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                View
                              </Link>
                            </Button>
                          )}
                          {project.repo && (
                            <Button asChild size="sm" variant="outline">
                              <Link href={project.repo} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3 mr-2" />
                                Code
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <Card className="print:border-none print:shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-3 w-3" />
                    <Button asChild variant="link" className="h-auto p-0 text-sm">
                      <Link href={`mailto:${siteConfig.contactEmail}`}>
                        {siteConfig.contactEmail}
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {socialData.slice(0, 4).map((social) => (
                      <SocialIconLink
                        key={social.platform}
                        social={social}
                        showLabel={true}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="print:border-none print:shadow-none">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}