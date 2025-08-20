'use client'

import { useEffect, useRef } from 'react'
import { useSideScrollerStore, useSceneInfo } from '@/app/_state/store'
import { PixelElement } from '@/app/_fx/pixel-snap'
import { ParallaxLayer, LAYER_FACTORS, LayerType } from '@/app/_fx/parallax'

export interface SceneConfig {
  id: string
  title: string
  background?: {
    color?: string
    texture?: string
    layers?: LayerConfig[]
  }
  pixelArt?: {
    atlas?: string
    sprites?: SpriteConfig[]
  }
}

export interface LayerConfig {
  id: string
  type: LayerType
  content: React.ReactNode
  className?: string
  factor?: number
}

export interface SpriteConfig {
  id: string
  src: string
  frames?: number
  width: number
  height: number
  animation?: {
    duration: number
    loop: boolean
    autoplay?: boolean
  }
}

interface SceneBaseProps {
  config: SceneConfig
  children?: React.ReactNode
  className?: string
}

export function SceneBase({ config, children, className = '' }: SceneBaseProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const pixelElements = useRef<Map<string, PixelElement>>(new Map())
  const parallaxLayers = useRef<Map<string, ParallaxLayer>>(new Map())
  
  const sceneInfo = useSceneInfo(config.id)
  const { reducedMotion, activateScene, deactivateScene } = useSideScrollerStore()

  // Register/unregister scene when visible
  useEffect(() => {
    if (!sceneInfo) return

    if (sceneInfo.isVisible) {
      activateScene(config.id)
    } else {
      deactivateScene(config.id)
    }

    return () => {
      deactivateScene(config.id)
    }
  }, [sceneInfo?.isVisible, config.id, activateScene, deactivateScene])

  // Initialize pixel elements and parallax layers
  useEffect(() => {
    if (!sceneRef.current || !sceneInfo?.isVisible) return

    // Create pixel elements for sprites
    config.pixelArt?.sprites?.forEach((sprite) => {
      const element = document.createElement('div')
      element.className = 'absolute pixel-crisp'
      element.style.backgroundImage = `url(${sprite.src})`
      element.style.backgroundRepeat = 'no-repeat'
      element.style.width = `${sprite.width * 2}px` // 2x scale
      element.style.height = `${sprite.height * 2}px`
      
      sceneRef.current?.appendChild(element)
      
      const pixelElement = new PixelElement(element, { pixelScale: 2 })
      pixelElements.current.set(sprite.id, pixelElement)
    })

    return () => {
      // Cleanup pixel elements
      pixelElements.current.forEach((element) => {
        element.move(0, 0) // Reset position
      })
      pixelElements.current.clear()
    }
  }, [config.pixelArt?.sprites, sceneInfo?.isVisible])

  // Animation updates based on scene progress
  useEffect(() => {
    if (!sceneInfo?.isActive || !sceneInfo.progress) return

    // Animate pixel elements based on progress
    const { progress } = sceneInfo
    
    // Example: Move sprite elements based on scene progress
    pixelElements.current.forEach((pixelElement, spriteId) => {
      if (reducedMotion) {
        // Simplified animation for reduced motion
        const opacity = progress > 0.5 ? 1 : 0.3
        pixelElement.setScale(1)
      } else {
        // Full animation
        const x = progress * 100 - 50 // Example movement
        const scale = 0.8 + (progress * 0.4) // Scale from 0.8 to 1.2
        pixelElement.setPosition(x, 0)
        pixelElement.setScale(scale)
      }
    })
  }, [sceneInfo?.progress, reducedMotion])

  // Don't render if not visible (optimization)
  if (!sceneInfo?.isVisible) {
    return null
  }

  const sceneOpacity = sceneInfo.isActive ? 1 : 0.3
  const sceneTransform = reducedMotion 
    ? 'none' 
    : `translateY(${(1 - sceneInfo.progress) * 20}px)`

  return (
    <div
      ref={sceneRef}
      className={`scene scene-${config.id} absolute inset-0 transition-all duration-500 ${className}`}
      style={{
        opacity: sceneOpacity,
        transform: sceneTransform,
        backgroundColor: config.background?.color,
      }}
      data-scene={config.id}
      aria-label={config.title}
    >
      {/* Background texture */}
      {config.background?.texture && (
        <div
          className="absolute inset-0 opacity-10 pixel-crisp"
          style={{
            backgroundImage: `url(${config.background.texture})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '64px 64px',
          }}
        />
      )}

      {/* Parallax layers */}
      {config.background?.layers?.map((layer) => (
        <div
          key={layer.id}
          className={`layer-${layer.type} absolute inset-0 ${layer.className || ''}`}
          style={{
            transform: `translateX(${-sceneInfo.progress * (layer.factor || LAYER_FACTORS[layer.type]) * 100}px)`,
          }}
        >
          {layer.content}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && useSideScrollerStore.getState().debugMode && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs font-mono">
          <div>Scene: {config.id}</div>
          <div>Progress: {sceneInfo.progress.toFixed(3)}</div>
          <div>Active: {sceneInfo.isActive ? 'yes' : 'no'}</div>
          <div>Sprites: {pixelElements.current.size}</div>
        </div>
      )}
    </div>
  )
}

// Helper hook for scene animations
export function useSceneAnimation(sceneId: string, animationFn: (progress: number) => void) {
  const sceneInfo = useSceneInfo(sceneId)
  
  useEffect(() => {
    if (sceneInfo?.isActive && typeof sceneInfo.progress === 'number') {
      animationFn(sceneInfo.progress)
    }
  }, [sceneInfo?.isActive, sceneInfo?.progress, animationFn])
}