'use client'

import { useEffect, useRef } from 'react'
import { useSideScrollerStore } from '@/app/_state/store'
import { ParallaxEngine } from '@/app/_fx/parallax'
import { ProgressTimeline, SmoothProgress, ScrollInputHandler } from '@/app/_fx/progress-timeline'
import { easings } from '@/app/_fx/easing'
import { HUD } from './HUD'

interface StageProps {
  children: React.ReactNode
  className?: string
}

export function Stage({ children, className = '' }: StageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const parallaxEngine = useRef<ParallaxEngine>()
  const smoothProgress = useRef<SmoothProgress>()
  const inputHandler = useRef<ScrollInputHandler>()
  const timeline = useRef<ProgressTimeline>()
  
  const {
    t,
    targetT,
    reducedMotion,
    debugMode,
    setT,
    setTargetT,
    addDelta,
    setInputMode,
    setScrolling,
  } = useSideScrollerStore()

  // Initialize systems
  useEffect(() => {
    if (!stageRef.current || !worldRef.current) return

    // Initialize parallax engine
    parallaxEngine.current = new ParallaxEngine(5000, 2)
    
    // Initialize smooth progress with momentum
    smoothProgress.current = new SmoothProgress(
      t,
      reducedMotion ? 0.2 : 0.1, // Faster damping if reduced motion
      (newT: number) => {
        setT(newT)
        updateWorldTransform(newT)
      }
    )

    // Initialize input handling
    inputHandler.current = new ScrollInputHandler(
      stageRef.current,
      (delta: number) => {
        if (!reducedMotion) {
          addDelta(delta)
        }
        setScrolling(true)
        setTimeout(() => setScrolling(false), 150)
      },
      (target: number) => {
        setTargetT(target)
      },
      reducedMotion ? 0.5 : 1 // Reduced sensitivity for reduced motion
    )

    // Auto-detect input mode
    const detectInputMode = () => {
      const userAgent = navigator.userAgent
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        setInputMode('touch')
      } else if (window.innerWidth < 768) {
        setInputMode('touch')
      } else {
        setInputMode('mouse')
      }
    }
    detectInputMode()

    return () => {
      parallaxEngine.current?.destroy()
      inputHandler.current?.destroy()
      timeline.current?.stop()
    }
  }, [reducedMotion, setT, setTargetT, addDelta, setInputMode, setScrolling])

  // Update smooth progress target when targetT changes
  useEffect(() => {
    if (smoothProgress.current) {
      smoothProgress.current.setTarget(targetT)
    }
  }, [targetT])

  // Update world transform
  const updateWorldTransform = (progress: number) => {
    if (!worldRef.current || !parallaxEngine.current) return

    // Update parallax layers
    parallaxEngine.current.updateProgress(progress)
    
    // Update world position for base layer
    const worldProgress = progress * 5000 // 500vw
    const transform = reducedMotion 
      ? `translateX(-${worldProgress}px)` // No 3D if reduced motion
      : `translate3d(-${worldProgress}px, 0, 0)`
    
    worldRef.current.style.transform = transform
  }

  // Deep link support - set initial position from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const section = params.get('section')
    
    if (section) {
      const store = useSideScrollerStore.getState()
      store.jumpToSection(section)
    }
  }, [])

  // Keyboard shortcuts for debugging
  useEffect(() => {
    if (!debugMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault()
            const store = useSideScrollerStore.getState()
            store.reset()
            break
          case 'd':
            e.preventDefault()
            useSideScrollerStore.getState().toggleDebugMode()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [debugMode])

  return (
    <>
      <div
        ref={stageRef}
        id="stage"
        className={`fixed inset-0 overflow-hidden bg-court-black grain-overlay ${className}`}
        tabIndex={0} // Make focusable for keyboard input
        role="application"
        aria-label="Interactive portfolio presentation"
      >
        <div
          ref={worldRef}
          id="world"
          className="absolute h-full will-change-transform"
          style={{ minWidth: '500vw' }}
        >
          {children}
        </div>

        {/* HUD overlay */}
        <HUD />

        {/* Debug info */}
        {debugMode && (
          <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg font-mono text-xs max-w-xs">
            <div>t: {t.toFixed(3)}</div>
            <div>target: {targetT.toFixed(3)}</div>
            <div>viewport: {useSideScrollerStore.getState().viewport.width}×{useSideScrollerStore.getState().viewport.height}</div>
            <div>motion: {reducedMotion ? 'reduced' : 'full'}</div>
            <div className="mt-2 text-xs opacity-75">
              Cmd+R: Reset | Cmd+D: Toggle Debug
            </div>
          </div>
        )}
      </div>

      {/* Accessibility: Screen reader content */}
      <div className="sr-only">
        <h1>Interactive Portfolio</h1>
        <p>
          This is an interactive side-scrolling portfolio presentation. 
          Use arrow keys or scroll to navigate between sections.
        </p>
        <nav aria-label="Portfolio sections">
          <ul>
            <li><a href="?section=intro">Introduction</a></li>
            <li><a href="?section=skills">Skills</a></li>
            <li><a href="?section=experience">Experience</a></li>
            <li><a href="?section=awards">Awards</a></li>
            <li><a href="?section=work">Work</a></li>
            <li><a href="?section=contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </>
  )
}