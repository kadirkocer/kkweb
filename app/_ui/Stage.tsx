'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useSideScrollerStore } from '@/app/_state/store'
import { ParallaxEngine } from '@/app/_fx/parallax'
import { PerformantInputHandler, SmoothProgress, AnimationProducer } from '@/app/_fx/progress-timeline'
import { easings } from '@/app/_fx/easing'
import { HUD } from './HUD'

interface StageProps {
  children: React.ReactNode
  className?: string
  totalScenes?: number // number of horizontal scenes (each 100vw)
}

// Scene virtualization for performance
interface SceneRef {
  element: HTMLElement
  bounds: { start: number; end: number }
  isVisible: boolean
  transform: string
}

// Cached layer references for fast DOM updates
interface LayerCache {
  world: HTMLDivElement | null
  parallaxLayers: HTMLElement[]
  scenes: Map<string, SceneRef>
}

export function Stage({ children, className = '', totalScenes = 6 }: StageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const layerCache = useRef<LayerCache>({ 
    world: null, 
    parallaxLayers: [],
    scenes: new Map()
  })
  
  // Performance optimization refs
  const parallaxEngine = useRef<ParallaxEngine>()
  const smoothProgress = useRef<SmoothProgress>()
  const inputHandler = useRef<PerformantInputHandler>()
  const animationProducer = useRef<AnimationProducer>()
  const worldPixelWidth = useRef<number>(0)
  const lastFrameTime = useRef<number>(0)
  const isUpdating = useRef<boolean>(false)
  
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

  // Optimized scene bounds calculation
  const sceneBounds = useMemo(() => [
    { id: 'intro', start: 0.00, end: 0.12 },
    { id: 'skills', start: 0.12, end: 0.34 },
    { id: 'experience', start: 0.34, end: 0.58 },
    { id: 'awards', start: 0.58, end: 0.72 },
    { id: 'work', start: 0.72, end: 0.88 },
    { id: 'contact', start: 0.88, end: 1.00 }
  ], [])

  // Scene virtualization - only render visible scenes
  const getVisibleScenes = useCallback((progress: number) => {
    const buffer = 0.05 // 5% buffer on each side
    return sceneBounds.filter(scene => 
      progress >= (scene.start - buffer) && progress <= (scene.end + buffer)
    )
  }, [sceneBounds])

  // High-performance transform update with caching
  const updateWorldTransform = useCallback((progress: number) => {
    if (isUpdating.current || !layerCache.current.world) return
    
    isUpdating.current = true
    
    try {
      // Determine pixel width on demand (world width - viewport width)
      if (!worldPixelWidth.current) {
        const stageEl = stageRef.current
        const worldEl = layerCache.current.world
        if (stageEl && worldEl) {
          const width = worldEl.scrollWidth - stageEl.clientWidth
          worldPixelWidth.current = Math.max(width, 0)
        }
      }
      const worldWidthPx = worldPixelWidth.current || 0
      const translateX = progress * worldWidthPx
      const transform = `translate3d(-${translateX}px,0,0)`
      
      // Only update if transform changed
      if (layerCache.current.world.style.transform !== transform) {
        layerCache.current.world.style.transform = transform
      }
      
      // Update parallax layers if available
      parallaxEngine.current?.updateProgress(progress)
      
      // Scene virtualization - hide/show scenes based on visibility
      const visibleScenes = getVisibleScenes(progress)
      const visibleIds = new Set(visibleScenes.map(s => s.id))
      
      layerCache.current.scenes.forEach((sceneRef, id) => {
        const shouldBeVisible = visibleIds.has(id)
        if (sceneRef.isVisible !== shouldBeVisible) {
          sceneRef.element.style.willChange = shouldBeVisible ? 'transform' : 'auto'
          sceneRef.element.style.visibility = shouldBeVisible ? 'visible' : 'hidden'
          sceneRef.isVisible = shouldBeVisible
        }
      })
      
    } finally {
      isUpdating.current = false
    }
  }, [getVisibleScenes])

  // RAF-based animation loop for consistent 60fps
  const animationLoop = useCallback((timestamp: number) => {
    // Throttle to 60fps
    if (timestamp - lastFrameTime.current >= 16.67) {
      const currentT = smoothProgress.current?.current || 0
      updateWorldTransform(currentT)
      lastFrameTime.current = timestamp
    }
  }, [updateWorldTransform])

  // Initialize high-performance systems
  useEffect(() => {
    if (!stageRef.current || !worldRef.current) return

  // Cache DOM references for performance
  layerCache.current.world = worldRef.current
    
    // Initialize scene references
    sceneBounds.forEach(scene => {
      const element = document.getElementById(`scene-${scene.id}`)
      if (element) {
        layerCache.current.scenes.set(scene.id, {
          element: element as HTMLElement,
          bounds: { start: scene.start, end: scene.end },
          isVisible: true,
          transform: ''
        })
      }
    })
    
    // Initialize parallax engine with performance optimizations
  // Instantiate animation producer & systems
  animationProducer.current = new AnimationProducer()

  // Compute initial world width now that DOM is laid out
  const width = (worldRef.current.scrollWidth - stageRef.current.clientWidth)
  worldPixelWidth.current = Math.max(width, 0)

  parallaxEngine.current = new ParallaxEngine(worldPixelWidth.current || 0, 2)
    
    // Initialize smooth progress with RAF-based updates
    smoothProgress.current = new SmoothProgress(
      t,
      reducedMotion ? 0.15 : 0.12,
      (newT: number) => {
        setT(newT)
        // Also update transform immediately for responsiveness
        updateWorldTransform(newT)
      }
    )

    // Initialize high-performance input handling
    inputHandler.current = new PerformantInputHandler(
      stageRef.current,
      (newT: number) => {
        setT(newT)
      },
      reducedMotion ? 0.15 : 0.12
    )

    // Auto-detect input mode with better mobile detection
    const detectInputMode = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (hasTouch || isMobile) {
        setInputMode('touch')
      } else {
        setInputMode('mouse')
      }
    }
    detectInputMode()

    // Subscribe to RAF updates
  // Subscribe to RAF updates
  const unsubscribeAnimation = animationProducer.current.subscribe(animationLoop)

  // Initial position
  updateWorldTransform(t)

    return () => {
  parallaxEngine.current?.destroy()
      inputHandler.current?.destroy()
      smoothProgress.current?.destroy()
      unsubscribeAnimation?.()
      
      // Clear cache
    layerCache.current = { world: null, parallaxLayers: [], scenes: new Map() }
    worldPixelWidth.current = 0
    }
  }, [reducedMotion, setT, setInputMode, animationLoop, sceneBounds, updateWorldTransform, t])

  // Optimized targetT updates
  useEffect(() => {
    if (smoothProgress.current && Math.abs(smoothProgress.current.target - targetT) > 0.001) {
      smoothProgress.current.setTarget(targetT)
    }
  }, [targetT])

  // Performance monitoring for debug mode
  const frameStats = useRef({ fps: 0, lastTime: 0, frameCount: 0 })
  
  useEffect(() => {
    if (!debugMode) return
    
    const measureFPS = () => {
      const now = performance.now()
      frameStats.current.frameCount++
      
      if (now - frameStats.current.lastTime >= 1000) {
        frameStats.current.fps = frameStats.current.frameCount
        frameStats.current.frameCount = 0
        frameStats.current.lastTime = now
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    measureFPS()
  }, [debugMode])

  // Deep link support - set initial position from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const section = params.get('section')
    
    if (section && smoothProgress.current) {
      const sectionData = sceneBounds.find(s => s.id === section)
      if (sectionData) {
        smoothProgress.current.setCurrent(sectionData.start, false)
        setT(sectionData.start)
      }
    }
  }, [sceneBounds, setT])

  // Optimized keyboard shortcuts for debugging
  useEffect(() => {
    if (!debugMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault()
            smoothProgress.current?.setCurrent(0)
            setT(0)
            break
          case 'd':
            e.preventDefault()
            useSideScrollerStore.getState().toggleDebugMode()
            break
          case 'p': // Performance profiling toggle
            e.preventDefault()
            console.log('Performance:', {
              fps: frameStats.current.fps,
              currentT: t,
              isAnimating: smoothProgress.current?.isActive,
              visibleScenes: getVisibleScenes(t)
            })
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [debugMode, t, getVisibleScenes, setT])

  return (
    <>
      <div
        ref={stageRef}
        id="stage"
        className={`fixed inset-0 overflow-hidden bg-court-black grain-overlay ${className}`}
        tabIndex={0} // Make focusable for keyboard input
        role="application"
        aria-label="Interactive portfolio presentation"
        style={{
          // Performance optimizations
          willChange: 'scroll-position',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        <div
          ref={worldRef}
          id="world"
          className="absolute h-full"
          style={{ 
            minWidth: `${totalScenes * 100}vw`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)' // Force hardware acceleration
          }}
        >
          {children}
        </div>

        {/* HUD overlay */}
        <HUD />

        {/* Enhanced debug info with performance metrics */}
        {debugMode && (
          <div className="fixed top-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg font-mono text-xs max-w-sm backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>t: {t.toFixed(3)}</div>
              <div>target: {targetT.toFixed(3)}</div>
              <div>fps: {frameStats.current.fps}</div>
              <div>scenes: {getVisibleScenes(t).length}</div>
              <div>viewport: {useSideScrollerStore.getState().viewport.width}×{useSideScrollerStore.getState().viewport.height}</div>
              <div>motion: {reducedMotion ? 'reduced' : 'full'}</div>
              <div>animating: {smoothProgress.current?.isActive ? 'yes' : 'no'}</div>
              <div>input: {useSideScrollerStore.getState().inputMode}</div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/20 text-xs opacity-75">
              <div>⌘R: Reset | ⌘D: Debug | ⌘P: Profile</div>
              <div className="mt-1">Visible: {getVisibleScenes(t).map(s => s.id).join(', ')}</div>
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
            {sceneBounds.map(scene => (
              <li key={scene.id}>
                <a href={`?section=${scene.id}`}>
                  {scene.id.charAt(0).toUpperCase() + scene.id.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}