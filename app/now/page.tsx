import { getTranslations } from 'next-intl/server'
import { siteConfig } from '@/site.config'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Briefcase, Code, Video, BookOpen, Users } from 'lucide-react'

export default async function NowPage() {
  const t = await getTranslations('now')
  const tCommon = await getTranslations('common')

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/resume', label: 'Resume' }
  ]

  const currentActivities = [
    {
      icon: Briefcase,
      title: 'Legal Intern',
      description: 'Working on competition law research and case summaries at a law firm. Focusing on document automation and legal tech implementations.',
      status: 'Active',
      period: '2025'
    },
    {
      icon: Code,
      title: 'AI Legal Tools Builder',
      description: 'Building RAG systems and microservices for legal document analysis. Working with FastAPI, Python, and modern AI frameworks.',
      status: 'Ongoing',
      period: '2024–'
    },
    {
      icon: Video,
      title: 'Content Creator',
      description: 'Creating vlogs and educational content about legal tech, AI developments, and student life. Publishing on YouTube and social platforms.',
      status: 'Active',
      period: '2024–'
    },
    {
      icon: BookOpen,
      title: 'Law Student',
      description: 'Studying competition law, legal research methodologies, and the intersection of technology and law.',
      status: 'Ongoing',
      period: 'Current'
    }
  ]

  const currentReads = [
    'AI and the Future of Law',
    'Competition Law in Digital Markets',
    'Building AI-Powered Applications'
  ]

  const currentTools = [
    'Python', 'FastAPI', 'Next.js', 'Tailwind CSS', 'Supabase', 'Vercel'
  ]

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={siteConfig.name}
        nav={nav}
      />
      
      <main id="main" className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            What I'm up to now
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A snapshot of my current activities, interests, and focus areas. 
            Inspired by Derek Sivers' now page movement.
          </p>
        </div>

        <div className="space-y-12">
          {/* Current Activities */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Current Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentActivities.map((activity, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <activity.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        {activity.title}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {activity.period}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {activity.description}
                    </CardDescription>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Current Focus */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Currently Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentReads.map((book, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {book}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Current Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentTools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Updates */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last updated: {lastUpdated}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This page follows the{' '}
                  <a 
                    href="https://nownownow.com/about" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    now page movement
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Notes */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Personal Updates</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                I'm currently balancing my law studies with hands-on experience in legal tech. 
                My focus is on understanding how AI can augment legal research and make legal 
                services more accessible.
              </p>
              <p>
                On the content side, I'm working on creating more structured educational 
                content about the intersection of law and technology, sharing both technical 
                tutorials and insights from the legal field.
              </p>
              <p>
                I'm also exploring opportunities to collaborate with other legal tech 
                enthusiasts and contribute to open-source projects in the legal domain.
              </p>
            </div>
          </section>

          <div className="text-center pt-8">
            <p className="text-muted-foreground">
              Want to know what I was up to in the past? Check out my{' '}
              <a href="/resume" className="underline hover:no-underline">
                resume
              </a>{' '}
              for a full timeline.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}