// Parallax effects with pixel-perfect positioning
export interface ParallaxLayer {
  id: string
  element: HTMLElement
  factor: number // Parallax speed multiplier (0-1)
  axis: 'x' | 'y' | 'both'
}

export interface Transform3D {
  x: number
  y: number
  z: number
  scale?: number
  rotate?: number
}

export class ParallaxEngine {
  private _layers: Map<string, ParallaxLayer> = new Map()
  private _worldWidth: number = 0
  private _viewportWidth: number = 0
  private _pixelScale: number = 2
  
  constructor(worldWidth: number = 5000, pixelScale: number = 2) {
    this._worldWidth = worldWidth
    this._viewportWidth = window.innerWidth
    this._pixelScale = pixelScale
    
    this._handleResize = this._handleResize.bind(this)
    window.addEventListener('resize', this._handleResize)
  }

  addLayer(layer: ParallaxLayer): void {
    this._layers.set(layer.id, layer)
  }

  removeLayer(id: string): void {
    this._layers.delete(id)
  }

  updateProgress(t: number): void {
    const worldProgress = t * this._worldWidth
    
    for (const layer of this._layers.values()) {
      const layerProgress = worldProgress * layer.factor
      const transform = this._calculateTransform(layerProgress, layer)
      this._applyTransform(layer.element, transform)
    }
  }

  private _calculateTransform(progress: number, layer: ParallaxLayer): Transform3D {
    let x = 0
    let y = 0
    
    if (layer.axis === 'x' || layer.axis === 'both') {
      x = -progress
    }
    
    if (layer.axis === 'y' || layer.axis === 'both') {
      y = -progress * 0.5 // Slower vertical movement
    }
    
    // Pixel-perfect snapping
    x = this._snapToPixelGrid(x)
    y = this._snapToPixelGrid(y)
    
    return { x, y, z: 0 }
  }

  private _applyTransform(element: HTMLElement, transform: Transform3D): void {
    const { x, y, z, scale = 1, rotate = 0 } = transform
    
    element.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale}) rotate(${rotate}deg)`
    element.style.willChange = 'transform'
  }

  private _snapToPixelGrid(value: number): number {
    const gridSize = 8 / this._pixelScale
    return Math.round(value / gridSize) * gridSize
  }

  private _handleResize(): void {
    this._viewportWidth = window.innerWidth
  }

  destroy(): void {
    window.removeEventListener('resize', this._handleResize)
    this._layers.clear()
  }
}

// Specific transform utilities
export function pixelSnap(value: number, gridSize: number = 8): number {
  return Math.round(value / gridSize) * gridSize;
}

export function calculateParallax(t: number, worldWidth: number, layerFactor: number = 1): string {
  const x = -t * worldWidth * layerFactor; 
  const snappedX = pixelSnap(x, 4); 
  return `translate3d(${snappedX}px, 0, 0)`;
}

export function createPixelTransform(
  x: number, 
  y: number, 
  pixelScale: number = 2,
  scale: number = 1
): string {
  const snappedX = pixelSnap(x, pixelScale)
  const snappedY = pixelSnap(y, pixelScale)
  
  return `translate3d(${snappedX}px, ${snappedY}px, 0) scale(${scale})`
}

// Layer management for different z-levels
export const LAYER_FACTORS = {
  bg: 0.1,      // Far background - very slow
  far: 0.3,     // Far elements
  mid: 0.6,     // Mid-ground elements
  near: 0.9,    // Near foreground - almost 1:1
  fg: 1.0,      // Foreground - 1:1 movement
} as const

export type LayerType = keyof typeof LAYER_FACTORS

export function createLayerElement(
  type: LayerType,
  className: string = '',
  content: string = ''
): HTMLElement {
  const element = document.createElement('div')
  element.className = `layer-${type} ${className}`.trim()
  element.innerHTML = content
  element.style.position = 'absolute'
  element.style.top = '0'
  element.style.left = '0'
  element.style.height = '100%'
  element.style.pointerEvents = 'none'
  
  return element
}

// Sprite animation utilities
export interface SpriteAnimation {
  frames: number
  frameWidth: number
  frameHeight: number
  duration: number
  loop: boolean
}

export class SpriteAnimator {
  private _element: HTMLElement
  private _animation: SpriteAnimation
  private _currentFrame: number = 0
  private _isPlaying: boolean = false
  private _startTime: number = 0
  private _rafId: number | null = null

  constructor(element: HTMLElement, animation: SpriteAnimation) {
    this._element = element
    this._animation = animation
    this._setupSprite()
  }

  play(): void {
    if (this._isPlaying) return
    
    this._isPlaying = true
    this._startTime = performance.now()
    this._animate()
  }

  pause(): void {
    this._isPlaying = false
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  stop(): void {
    this.pause()
    this._currentFrame = 0
    this._updateFrame()
  }

  private _setupSprite(): void {
    const { frameWidth, frameHeight } = this._animation
    
    this._element.style.width = `${frameWidth}px`
    this._element.style.height = `${frameHeight}px`
    this._element.style.backgroundSize = `${frameWidth * this._animation.frames}px ${frameHeight}px`
    this._element.style.imageRendering = 'pixelated'
  }

  private _animate = (): void => {
    if (!this._isPlaying) return

    const elapsed = performance.now() - this._startTime
    const frameTime = this._animation.duration / this._animation.frames
    const newFrame = Math.floor((elapsed / frameTime) % this._animation.frames)
    
    if (newFrame !== this._currentFrame) {
      this._currentFrame = newFrame
      this._updateFrame()
    }

    if (this._animation.loop || elapsed < this._animation.duration) {
      this._rafId = requestAnimationFrame(this._animate)
    } else {
      this.pause()
    }
  }

  private _updateFrame(): void {
    const offsetX = -this._currentFrame * this._animation.frameWidth
    this._element.style.backgroundPositionX = `${offsetX}px`
  }
}