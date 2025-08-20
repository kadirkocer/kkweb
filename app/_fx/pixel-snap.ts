// Pixel-perfect positioning utilities for crisp rendering
export interface PixelSnapConfig {
  basePixelSize: number // Base pixel size (e.g., 8px grid)
  pixelScale: number // Retina scaling factor (e.g., 2x)
  roundingMode: 'floor' | 'ceil' | 'round'
}

export const defaultPixelSnapConfig: PixelSnapConfig = {
  basePixelSize: 8,
  pixelScale: 2,
  roundingMode: 'round',
}

// Snap a single value to the pixel grid
export function snapToPixelGrid(
  value: number,
  config: Partial<PixelSnapConfig> = {}
): number {
  const { basePixelSize, pixelScale, roundingMode } = {
    ...defaultPixelSnapConfig,
    ...config,
  }

  const gridSize = basePixelSize / pixelScale
  
  switch (roundingMode) {
    case 'floor':
      return Math.floor(value / gridSize) * gridSize
    case 'ceil':
      return Math.ceil(value / gridSize) * gridSize
    case 'round':
    default:
      return Math.round(value / gridSize) * gridSize
  }
}

// Snap a 2D position to the pixel grid
export function snapPosition(
  x: number,
  y: number,
  config?: Partial<PixelSnapConfig>
): { x: number; y: number } {
  return {
    x: snapToPixelGrid(x, config),
    y: snapToPixelGrid(y, config),
  }
}

// Snap a bounding box to the pixel grid
export function snapBounds(
  left: number,
  top: number,
  width: number,
  height: number,
  config?: Partial<PixelSnapConfig>
): { left: number; top: number; width: number; height: number } {
  const snappedLeft = snapToPixelGrid(left, config)
  const snappedTop = snapToPixelGrid(top, config)
  const snappedRight = snapToPixelGrid(left + width, config)
  const snappedBottom = snapToPixelGrid(top + height, config)
  
  return {
    left: snappedLeft,
    top: snappedTop,
    width: snappedRight - snappedLeft,
    height: snappedBottom - snappedTop,
  }
}

// Create a CSS transform with pixel snapping
export function createSnappedTransform(
  x: number,
  y: number,
  scale: number = 1,
  rotate: number = 0,
  config?: Partial<PixelSnapConfig>
): string {
  const snapped = snapPosition(x, y, config)
  
  let transform = `translate3d(${snapped.x}px, ${snapped.y}px, 0)`
  
  if (scale !== 1) {
    transform += ` scale(${scale})`
  }
  
  if (rotate !== 0) {
    transform += ` rotate(${rotate}deg)`
  }
  
  return transform
}

// Apply pixel snapping to an element's transform
export function applySnappedTransform(
  element: HTMLElement,
  x: number,
  y: number,
  scale: number = 1,
  rotate: number = 0,
  config?: Partial<PixelSnapConfig>
): void {
  element.style.transform = createSnappedTransform(x, y, scale, rotate, config)
  element.style.willChange = 'transform'
}

// Utility class for managing pixel-perfect elements
export class PixelElement {
  private _element: HTMLElement
  private _config: PixelSnapConfig
  private _x: number = 0
  private _y: number = 0
  private _scale: number = 1
  private _rotate: number = 0

  constructor(element: HTMLElement, config?: Partial<PixelSnapConfig>) {
    this._element = element
    this._config = { ...defaultPixelSnapConfig, ...config }
    this._setupElement()
  }

  get x(): number { return this._x }
  get y(): number { return this._y }
  get scale(): number { return this._scale }
  get rotate(): number { return this._rotate }

  setPosition(x: number, y: number): void {
    this._x = x
    this._y = y
    this._updateTransform()
  }

  setScale(scale: number): void {
    this._scale = scale
    this._updateTransform()
  }

  setRotation(degrees: number): void {
    this._rotate = degrees
    this._updateTransform()
  }

  move(deltaX: number, deltaY: number): void {
    this.setPosition(this._x + deltaX, this._y + deltaY)
  }

  private _setupElement(): void {
    // Ensure crisp pixel rendering
    this._element.style.imageRendering = 'pixelated'
    this._element.style.imageRendering = '-moz-crisp-edges'
    this._element.style.imageRendering = 'crisp-edges'
    
    // Force hardware acceleration
    this._element.style.backfaceVisibility = 'hidden'
    this._element.style.perspective = '1000px'
  }

  private _updateTransform(): void {
    applySnappedTransform(
      this._element,
      this._x,
      this._y,
      this._scale,
      this._rotate,
      this._config
    )
  }
}

// Sprite sheet utilities with pixel snapping
export interface SpriteFrame {
  x: number
  y: number
  width: number
  height: number
}

export class PixelSprite {
  private _element: HTMLElement
  private _config: PixelSnapConfig
  private _spriteUrl: string
  private _frames: SpriteFrame[]
  private _currentFrame: number = 0

  constructor(
    element: HTMLElement,
    spriteUrl: string,
    frames: SpriteFrame[],
    config?: Partial<PixelSnapConfig>
  ) {
    this._element = element
    this._spriteUrl = spriteUrl
    this._frames = frames
    this._config = { ...defaultPixelSnapConfig, ...config }
    this._setupSprite()
  }

  get currentFrame(): number {
    return this._currentFrame
  }

  get totalFrames(): number {
    return this._frames.length
  }

  setFrame(frameIndex: number): void {
    if (frameIndex < 0 || frameIndex >= this._frames.length) {
      console.warn(`Frame index ${frameIndex} out of bounds`)
      return
    }

    this._currentFrame = frameIndex
    this._updateSpritePosition()
  }

  nextFrame(): void {
    this.setFrame((this._currentFrame + 1) % this._frames.length)
  }

  previousFrame(): void {
    this.setFrame(this._currentFrame === 0 ? this._frames.length - 1 : this._currentFrame - 1)
  }

  private _setupSprite(): void {
    const firstFrame = this._frames[0]
    if (!firstFrame) return

    // Set element size to frame size
    this._element.style.width = `${firstFrame.width * this._config.pixelScale}px`
    this._element.style.height = `${firstFrame.height * this._config.pixelScale}px`
    
    // Set background image
    this._element.style.backgroundImage = `url(${this._spriteUrl})`
    this._element.style.backgroundRepeat = 'no-repeat'
    this._element.style.imageRendering = 'pixelated'
    this._element.style.imageRendering = '-moz-crisp-edges'
    this._element.style.imageRendering = 'crisp-edges'
    
    this._updateSpritePosition()
  }

  private _updateSpritePosition(): void {
    const frame = this._frames[this._currentFrame]
    if (!frame) return

    // Snap the background position to pixel grid
    const bgX = snapToPixelGrid(-frame.x * this._config.pixelScale, this._config)
    const bgY = snapToPixelGrid(-frame.y * this._config.pixelScale, this._config)
    
    this._element.style.backgroundPosition = `${bgX}px ${bgY}px`
    this._element.style.backgroundSize = `${frame.width * this._config.pixelScale}px ${frame.height * this._config.pixelScale}px`
  }
}

// Utility functions for common sprite operations
export function createSpriteFrames(
  rows: number,
  columns: number,
  frameWidth: number,
  frameHeight: number
): SpriteFrame[] {
  const frames: SpriteFrame[] = []
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      frames.push({
        x: col * frameWidth,
        y: row * frameHeight,
        width: frameWidth,
        height: frameHeight,
      })
    }
  }
  
  return frames
}

export function createAnimationFrames(
  startX: number,
  startY: number,
  frameCount: number,
  frameWidth: number,
  frameHeight: number,
  direction: 'horizontal' | 'vertical' = 'horizontal'
): SpriteFrame[] {
  const frames: SpriteFrame[] = []
  
  for (let i = 0; i < frameCount; i++) {
    if (direction === 'horizontal') {
      frames.push({
        x: startX + (i * frameWidth),
        y: startY,
        width: frameWidth,
        height: frameHeight,
      })
    } else {
      frames.push({
        x: startX,
        y: startY + (i * frameHeight),
        width: frameWidth,
        height: frameHeight,
      })
    }
  }
  
  return frames
}