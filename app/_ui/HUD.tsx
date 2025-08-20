'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { useSideScrollerStore, useCurrentSection, SCENES } from '@/app/_state/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HUD() {
  const {
    t,
    targetT,
    isAnimating,
    isPaused,
    inputMode,
    reducedMotion,
    debugMode,
    isScrolling,
    setTargetT,
    jumpToSection,
    play,
    pause,
    reset,
    addDelta,
  } = useSideScrollerStore()

  const currentSection = useCurrentSection()
  const [showNudgeButtons, setShowNudgeButtons] = useState(false)

  // Show nudge buttons for accessibility or mobile
  useEffect(() => {
    const shouldShow = inputMode === 'keyboard' || inputMode === 'touch' || reducedMotion
    setShowNudgeButtons(shouldShow)
  }, [inputMode, reducedMotion])

  // Box mark with current section
  const boxMarkContent = currentSection?.id.toUpperCase() || 'KADIR'

  return (
    <div className="pointer-events-none">
      {/* Box Mark - Top Left */}
      <div className="hud-box-mark pointer-events-auto">
        <div className="box-mark">
          {boxMarkContent}
        </div>
      </div>

      {/* Progress Bar - Bottom Center */}
      <div className="hud-progress pointer-events-auto">
        <div className="bg-mid-panel border border-line rounded-full px-4 py-2 flex items-center gap-3">
          {/* Progress track */}
          <div className="relative w-64 h-1 bg-line rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gold rounded-full transition-all duration-300 ease-out"
              style={{ width: `${t * 100}%` }}
            />
            {/* Target indicator */}
            <div
              className="absolute inset-y-0 w-0.5 bg-ink/60 transition-all duration-300"
              style={{ left: `${targetT * 100}%` }}
            />
            {/* Section markers */}
            {SCENES.map((scene, index) => (
              <button
                key={scene.id}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-muted rounded-full hover:bg-ink transition-colors focus-ring"
                style={{ left: `${scene.tStart * 100}%` }}
                onClick={() => jumpToSection(scene.id)}
                aria-label={`Jump to ${scene.id} section`}
                title={scene.id.charAt(0).toUpperCase() + scene.id.slice(1)}
              />
            ))}
          </div>

          {/* Progress text */}
          <div className="text-xs text-muted font-mono min-w-[4rem]">
            {Math.round(t * 100)}%
          </div>
        </div>
      </div>

      {/* Scene Dots - Right Side */}
      <div className="hud-scene-dots">
        {SCENES.map((scene, index) => {
          const isActive = currentSection?.id === scene.id
          const hasVisited = t > scene.tEnd
          
          return (
            <button
              key={scene.id}
              className={cn(
                'scene-dot pointer-events-auto focus-ring',
                isActive && 'active',
                hasVisited && 'opacity-60'
              )}
              onClick={() => jumpToSection(scene.id)}
              aria-label={`Go to ${scene.id} section`}
              title={scene.id.charAt(0).toUpperCase() + scene.id.slice(1)}
            />
          )
        })}
      </div>

      {/* Nudge Buttons - Bottom Right */}
      {showNudgeButtons && (
        <div className="nudge-buttons pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="nudge-btn"
            onClick={() => addDelta(-0.05)}
            aria-label="Go back"
            disabled={t <= 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="nudge-btn"
            onClick={() => addDelta(0.05)}
            aria-label="Go forward"
            disabled={t >= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Debug Controls */}
      {debugMode && (
        <div className="fixed bottom-4 left-4 pointer-events-auto">
          <div className="bg-black/80 rounded-lg p-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={isAnimating ? pause : play}
              className="text-white hover:bg-white/10"
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="text-white text-xs font-mono">
              {isScrolling && <span className="text-green-400">SCROLL</span>}
              {reducedMotion && <span className="text-orange-400 ml-2">REDUCED</span>}
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isScrolling && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-16 h-1 bg-mid-panel rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-transform duration-300"
              style={{ transform: `translateX(${(t * 200) - 100}%)` }}
            />
          </div>
        </div>
      )}

      {/* Reduced motion notice */}
      {reducedMotion && (
        <div className="fixed top-16 left-4 pointer-events-none z-40">
          <div className="bg-orange-100 border border-orange-200 rounded-lg px-3 py-2 max-w-xs">
            <p className="text-orange-800 text-sm">
              <strong>Reduced motion mode:</strong> Animations are simplified for accessibility.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}