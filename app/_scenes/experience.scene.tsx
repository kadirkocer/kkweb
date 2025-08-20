'use client'

import { SceneBase, SceneConfig, useSceneAnimation } from './SceneBase'
import { useRef } from 'react'
import { GoldenScale, AvatarRun } from '@/components/PixelSprite'
import { useSideScrollerStore } from '@/app/_state/store'

const experienceConfig: SceneConfig = {
  id: 'experience',
  title: 'Professional Experience',
  background: {
    color: 'var(--court-black)',
    texture: '/textures/grain.png',
    layers: [
      {
        id: 'courthouse-columns',
        type: 'mid',
        factor: 0.5,
        content: (
          <div className="absolute inset-0 opacity-20">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: 'url(/pixel/court-columns.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated'
              }}
            />
          </div>
        )
      }
    ]
  }
}

export function ExperienceScene() {
  const titleRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useSideScrollerStore()

  useSceneAnimation('experience', (progress: number) => {
    if (titleRef.current) {
      const titleProgress = Math.max(0, Math.min(1, progress / 0.3))
      titleRef.current.style.opacity = titleProgress.toString()
      if (!reducedMotion) {
        titleRef.current.style.transform = `translateY(${(1 - titleProgress) * 40}px)`
      }
    }

    if (contentRef.current) {
      const contentProgress = Math.max(0, Math.min(1, (progress - 0.2) / 0.5))
      contentRef.current.style.opacity = contentProgress.toString()
      if (!reducedMotion) {
        contentRef.current.style.transform = `translateY(${(1 - contentProgress) * 30}px)`
      }
    }

    if (scaleRef.current) {
      const scaleProgress = Math.max(0, Math.min(1, (progress - 0.4) / 0.3))
      scaleRef.current.style.opacity = scaleProgress.toString()
      if (!reducedMotion) {
        scaleRef.current.style.transform = `translateY(${(1 - scaleProgress) * 50}px) rotate(${scaleProgress * 10}deg)`
      }
    }

    if (avatarRef.current) {
      const avatarProgress = Math.max(0, Math.min(1, (progress - 0.6) / 0.4))
      avatarRef.current.style.opacity = avatarProgress.toString()
      if (!reducedMotion) {
        avatarRef.current.style.transform = `translateX(${(1 - avatarProgress) * 100}px)`
      }
    }
  })

  return (
    <SceneBase config={experienceConfig}>
      <div className="max-w-6xl mx-auto px-8 relative">
        {/* Pixel art decorations */}
        <div
          ref={scaleRef}
          className="absolute top-8 right-8 opacity-0 transition-all duration-1000"
        >
          <GoldenScale scale={3} className="drop-shadow-xl" />
        </div>

        <div
          ref={avatarRef}
          className="absolute bottom-8 right-16 opacity-0 transition-all duration-1000"
        >
          <AvatarRun scale={3} className="drop-shadow-lg" />
        </div>

        <div className="text-center">
          <div
            ref={titleRef}
            className="opacity-0 transition-all duration-1000 mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-ink font-display mb-4">
              EXPERIENCE
            </h2>
            <div className="w-24 h-1 bg-gold mx-auto" />
          </div>

          <div
            ref={contentRef}
            className="opacity-0 transition-all duration-1000 space-y-8"
          >
            {/* Experience timeline placeholder with pixel styling */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-mid-panel/30 border border-line p-6 pixel-crisp">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-gold pixel-crisp" />
                  <h3 className="text-xl font-bold text-ink">Legal Tech</h3>
                </div>
                <p className="text-muted">
                  Building innovative solutions at the intersection of law and technology.
                </p>
              </div>

              <div className="bg-mid-panel/30 border border-line p-6 pixel-crisp">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-street-red pixel-crisp" />
                  <h3 className="text-xl font-bold text-ink">Software Engineering</h3>
                </div>
                <p className="text-muted">
                  Full-stack development with focus on scalable, maintainable solutions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted">
              <div className="w-4 h-1 bg-gold pixel-crisp" />
              <span className="box-mark">COURT × STREET × PIXEL</span>
              <div className="w-4 h-1 bg-gold pixel-crisp" />
            </div>
          </div>
        </div>
      </div>
    </SceneBase>
  )
}
