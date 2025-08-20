'use client'

import { SceneBase, SceneConfig, useSceneAnimation } from './SceneBase'
import { useSideScrollerStore } from '@/app/_state/store'
import { useEffect, useRef } from 'react'

const introConfig: SceneConfig = {
  id: 'intro',
  title: 'Introduction',
  background: {
    color: 'var(--court-black)',
    texture: '/textures/grain.png',
    layers: [
      {
        id: 'city-silhouette',
        type: 'bg',
        factor: 0.1,
        content: (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-mid-panel/50 to-transparent" />
        )
      },
      {
        id: 'courthouse',
        type: 'far',
        factor: 0.3,
        content: (
          <div className="absolute bottom-0 left-1/4 w-48 h-64 bg-mid-panel/30 pixel-crisp">
            {/* Pixelated courthouse silhouette */}
            <div className="absolute inset-x-0 top-4 h-8 bg-line" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-4 bg-gold" />
          </div>
        )
      }
    ]
  },
  pixelArt: {
    sprites: [
      {
        id: 'gavel',
        src: '/pixel/gavel.png',
        width: 16,
        height: 16,
        animation: {
          duration: 2000,
          loop: true,
          autoplay: true
        }
      }
    ]
  }
}

export function IntroScene() {
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useSideScrollerStore()

  // Animate text elements
  useSceneAnimation('intro', (progress: number) => {
    if (titleRef.current) {
      if (reducedMotion) {
        titleRef.current.style.opacity = progress > 0.2 ? '1' : '0'
      } else {
        const titleProgress = Math.max(0, Math.min(1, (progress - 0.1) / 0.4))
        titleRef.current.style.opacity = titleProgress.toString()
        titleRef.current.style.transform = `translateY(${(1 - titleProgress) * 30}px)`
      }
    }

    if (subtitleRef.current) {
      if (reducedMotion) {
        subtitleRef.current.style.opacity = progress > 0.5 ? '1' : '0'
      } else {
        const subtitleProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.4))
        subtitleRef.current.style.opacity = subtitleProgress.toString()
        subtitleRef.current.style.transform = `translateY(${(1 - subtitleProgress) * 20}px)`
      }
    }
  })

  return (
    <SceneBase config={introConfig}>
      <div className="text-center space-y-8 max-w-4xl mx-auto px-8">
        {/* Main title with stencil effect */}
        <div
          ref={titleRef}
          className="opacity-0 transition-all duration-1000"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-ink mb-4">
            KADIR
          </h1>
          <div className="w-32 h-1 bg-gold mx-auto gold-hairline" />
        </div>

        {/* Subtitle with pixel accents */}
        <div
          ref={subtitleRef}
          className="opacity-0 transition-all duration-1000 delay-500"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-1 bg-street-red pixel-crisp" />
            <p className="text-xl md:text-2xl text-muted font-medium stencil-label">
              SOFTWARE ENGINEER × LEGAL TECH SPECIALIST
            </p>
            <div className="w-8 h-1 bg-street-red pixel-crisp" />
          </div>

          {/* Court × Street × Pixel tagline */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted">
            <span className="box-mark">COURT</span>
            <span className="text-gold">×</span>
            <span className="box-mark bg-mid-panel border border-line">STREET</span>
            <span className="text-gold">×</span>
            <span className="box-mark bg-transparent border border-gold text-gold">PIXEL</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-muted text-sm mb-2">SCROLL TO EXPLORE</div>
          <div className="w-1 h-8 bg-gradient-to-b from-gold to-transparent mx-auto" />
        </div>
      </div>
    </SceneBase>
  )
}