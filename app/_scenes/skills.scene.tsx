'use client'

import { SceneBase, SceneConfig, useSceneAnimation } from './SceneBase'
import { useSideScrollerStore } from '@/app/_state/store'
import { useRef } from 'react'

const skillsConfig: SceneConfig = {
  id: 'skills',
  title: 'Skills & Technologies',
  background: {
    color: 'var(--mid-panel)',
    layers: [
      {
        id: 'code-lines',
        type: 'bg',
        factor: 0.1,
        content: (
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-line"
                style={{ top: `${i * 5}%` }}
              />
            ))}
          </div>
        )
      },
      {
        id: 'terminal',
        type: 'far',
        factor: 0.4,
        content: (
          <div className="absolute right-1/4 top-1/4 w-64 h-48 bg-court-black border border-line pixel-crisp">
            <div className="p-4 font-mono text-xs text-pixel-grass">
              <div className="text-gold">$ whoami</div>
              <div>full-stack-engineer</div>
              <div className="text-gold mt-2">$ ls skills/</div>
              <div>react/ next/ typescript/</div>
              <div>node/ python/ legal-tech/</div>
              <div className="text-gold mt-2">$ █</div>
            </div>
          </div>
        )
      }
    ]
  }
}

const skillCategories = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: '⚡',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    color: 'var(--pixel-sky)'
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: '⚙️',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'GraphQL'],
    color: 'var(--pixel-grass)'
  },
  {
    id: 'legal-tech',
    title: 'Legal Tech',
    icon: '⚖️',
    skills: ['Document Automation', 'Compliance Systems', 'Legal APIs', 'Case Management'],
    color: 'var(--gold)'
  },
  {
    id: 'tools',
    title: 'Tools & Platforms',
    icon: '🔧',
    skills: ['Docker', 'AWS', 'Vercel', 'Git', 'Linear'],
    color: 'var(--street-red)'
  }
]

export function SkillsScene() {
  const gridRef = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useSideScrollerStore()

  useSceneAnimation('skills', (progress: number) => {
    if (!gridRef.current) return

    const cards = gridRef.current.children
    Array.from(cards).forEach((card, index) => {
      const htmlCard = card as HTMLElement
      const delay = index * 0.1
      const cardProgress = Math.max(0, Math.min(1, (progress - delay) / 0.4))

      if (reducedMotion) {
        htmlCard.style.opacity = cardProgress > 0.5 ? '1' : '0.3'
      } else {
        htmlCard.style.opacity = cardProgress.toString()
        htmlCard.style.transform = `
          translateY(${(1 - cardProgress) * 50}px) 
          scale(${0.9 + cardProgress * 0.1})
        `
      }
    })
  })

  return (
    <SceneBase config={skillsConfig}>
      <div className="max-w-6xl mx-auto px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-12 h-1 bg-gold pixel-crisp" />
            <h2 className="text-4xl font-bold text-ink font-display">
              TECHNICAL ARSENAL
            </h2>
            <div className="w-12 h-1 bg-gold pixel-crisp" />
          </div>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            A comprehensive toolkit spanning full-stack development and legal technology,
            forged through years of building production systems.
          </p>
        </div>

        {/* Skills grid */}
        <div 
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {skillCategories.map((category, index) => (
            <div
              key={category.id}
              className="bg-court-black/50 border border-line rounded-lg p-6 opacity-0 transition-all duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-8 h-8 rounded pixel-crisp flex items-center justify-center text-lg"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-ink">{category.title}</h3>
              </div>

              {/* Skills list */}
              <div className="space-y-2">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
                  >
                    <div 
                      className="w-2 h-2 pixel-crisp"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>

              {/* Pixel decoration */}
              <div className="mt-4 pt-4 border-t border-line/30">
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 pixel-crisp"
                      style={{
                        backgroundColor: i < category.skills.length ? category.color : 'var(--line)',
                        opacity: i < category.skills.length ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="text-gold text-xs font-mono">FULL_STACK_READY</div>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>
      </div>
    </SceneBase>
  )
}