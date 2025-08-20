'use client'

import { useEffect, useRef, useState } from 'react'

interface AtlasFrame {
  frame: { x: number; y: number; w: number; h: number }
  sourceSize: { w: number; h: number }
  spriteSourceSize: { x: number; y: number; w: number; h: number }
}

interface Atlas {
  meta: {
    image: string
    size: { w: number; h: number }
    scale: string
  }
  frames: Record<string, AtlasFrame>
}

interface PixelSpriteProps {
  sprite: string
  scale?: number
  className?: string
  style?: React.CSSProperties
  animation?: {
    frames: string[]
    duration: number
    loop?: boolean
    autoplay?: boolean
  }
}

// Cache for loaded atlases
const atlasCache = new Map<string, Atlas>()

export function PixelSprite({ 
  sprite, 
  scale = 2, 
  className = '', 
  style = {},
  animation 
}: PixelSpriteProps) {
  const spriteRef = useRef<HTMLDivElement>(null)
  const [atlas, setAtlas] = useState<Atlas | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const animationRef = useRef<number>()

  // Load atlas data
  useEffect(() => {
    const loadAtlas = async () => {
      try {
        if (atlasCache.has('main')) {
          setAtlas(atlasCache.get('main')!)
          return
        }

        const response = await fetch('/pixel/atlas.json')
        const atlasData: Atlas = await response.json()
        atlasCache.set('main', atlasData)
        setAtlas(atlasData)
      } catch (error) {
        console.error('Failed to load pixel atlas:', error)
      }
    }

    loadAtlas()
  }, [])

  // Handle sprite animation
  useEffect(() => {
    if (!animation || !animation.autoplay) return

    const { frames, duration, loop = true } = animation
    if (frames.length <= 1) return

    const frameTime = duration / frames.length
    let frameIndex = 0
    let startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime

      if (elapsed >= frameTime) {
        frameIndex = (frameIndex + 1) % frames.length
        setCurrentFrame(frameIndex)
        startTime = currentTime

        // Stop if not looping and we've completed one cycle
        if (!loop && frameIndex === 0 && elapsed > duration) {
          return
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animation])

  if (!atlas) {
    return <div className={`pixel-sprite-loading ${className}`} style={style} />
  }

  // Get the current sprite frame
  const currentSprite = animation ? animation.frames[currentFrame] : sprite
  const frame = atlas.frames[currentSprite]

  if (!frame) {
    console.warn(`Sprite "${currentSprite}" not found in atlas`)
    return <div className={`pixel-sprite-error ${className}`} style={style} />
  }

  const { frame: frameData, sourceSize } = frame
  const atlasScale = parseInt(atlas.meta.scale) || 2

  return (
    <div
      ref={spriteRef}
      className={`pixel-sprite pixel-crisp ${className}`}
      style={{
        width: sourceSize.w * scale,
        height: sourceSize.h * scale,
        backgroundImage: `url(/pixel/${atlas.meta.image})`,
        backgroundPosition: `-${frameData.x * scale / atlasScale}px -${frameData.y * scale / atlasScale}px`,
        backgroundSize: `${atlas.meta.size.w * scale / atlasScale}px ${atlas.meta.size.h * scale / atlasScale}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        ...style
      }}
      data-sprite={currentSprite}
    />
  )
}

export function GoldenGavel({ scale = 2, className = '', style = {} }: Omit<PixelSpriteProps, 'sprite'>) {
  return (
    <div
      className={`pixel-sprite pixel-crisp ${className} animate-bounce`}
      style={{
        width: 16 * scale,
        height: 16 * scale,
        backgroundImage: 'url(/pixel/gavel-gold.webp)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        ...style
      }}
    />
  )
}

export function GoldenScale({ scale = 2, className = '', style = {} }: Omit<PixelSpriteProps, 'sprite'>) {
  return (
    <div
      className={`pixel-sprite pixel-crisp ${className} animate-pulse`}
      style={{
        width: 16 * scale,
        height: 16 * scale,
        backgroundImage: 'url(/pixel/scale-gold.webp)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        ...style
      }}
    />
  )
}

export function AvatarIdle({ scale = 2, className = '', style = {} }: Omit<PixelSpriteProps, 'sprite'>) {
  return (
    <div
      className={`pixel-sprite pixel-crisp ${className}`}
      style={{
        width: 16 * scale,
        height: 16 * scale,
        backgroundImage: 'url(/pixel/avatar-idle.webp)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        ...style
      }}
    />
  )
}

export function AvatarRun({ scale = 2, className = '', style = {} }: Omit<PixelSpriteProps, 'sprite'>) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const animationRef = useRef<number>()

  const frames = [
    '/pixel/avatar-run-0.webp',
    '/pixel/avatar-run-1.webp', 
    '/pixel/avatar-run-2.webp',
    '/pixel/avatar-run-3.webp',
    '/pixel/avatar-run-4.webp',
    '/pixel/avatar-run-5.webp'
  ]

  useEffect(() => {
    const frameTime = 100 // 100ms per frame for smooth animation
    let frameIndex = 0
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameTime) {
        frameIndex = (frameIndex + 1) % frames.length
        setCurrentFrame(frameIndex)
        lastTime = currentTime
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [frames.length])

  return (
    <div
      className={`pixel-sprite pixel-crisp ${className}`}
      style={{
        width: 16 * scale,
        height: 16 * scale,
        backgroundImage: `url(${frames[currentFrame]})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        ...style
      }}
    />
  )
}
