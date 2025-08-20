// RAF-based progress timeline for smooth 60fps animations
export interface ProgressTimelineConfig {
  onProgress: (t: number) => void
  onComplete?: () => void
  duration?: number
  autoStart?: boolean
}

export interface TimelineSection {
  id: string
  tStart: number
  tEnd: number
  easing: EasingFunction
}

export type EasingFunction = (t: number) => number

// Easing functions matching the spec
export const easings = {
  linear: (t: number) => t,
  cubic: (t: number) => t * t * t * (t * (6 * t - 15) + 10),
  quadOut: (t: number) => 1 - (1 - t) * (1 - t),
  quadInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  backOut: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
}

export class ProgressTimeline {
  private _t: number = 0
  private _isRunning: boolean = false
  private _rafId: number | null = null
  private _config: ProgressTimelineConfig
  private _startTime: number = 0
  
  constructor(config: ProgressTimelineConfig) {
    this._config = config
    if (config.autoStart) {
      this.start()
    }
  }

  get t(): number {
    return this._t
  }

  get isRunning(): boolean {
    return this._isRunning
  }

  start(): void {
    if (this._isRunning) return
    
    this._isRunning = true
    this._startTime = performance.now()
    this._tick()
  }

  stop(): void {
    if (!this._isRunning) return
    
    this._isRunning = false
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  setProgress(t: number): void {
    this._t = Math.max(0, Math.min(1, t))
    this._config.onProgress(this._t)
    
    if (this._t >= 1 && this._config.onComplete) {
      this._config.onComplete()
    }
  }

  private _tick = (): void => {
    if (!this._isRunning) return

    const now = performance.now()
    const elapsed = now - this._startTime
    const duration = this._config.duration || 1000
    
    const newT = Math.min(elapsed / duration, 1)
    this.setProgress(newT)
    
    if (newT < 1) {
      this._rafId = requestAnimationFrame(this._tick)
    } else {
      this.stop()
    }
  }
}

// Section-based timeline for managing different parts of the animation
export class SectionTimeline {
  private _sections: TimelineSection[]
  private _currentSection: string | null = null
  
  constructor(sections: TimelineSection[]) {
    this._sections = sections.sort((a, b) => a.tStart - b.tStart)
  }

  getCurrentSection(t: number): TimelineSection | null {
    return this._sections.find(section => t >= section.tStart && t <= section.tEnd) || null
  }

  getSectionProgress(t: number, sectionId?: string): number {
    const section = sectionId 
      ? this._sections.find(s => s.id === sectionId)
      : this.getCurrentSection(t)
    
    if (!section) return 0
    
    const rawProgress = (t - section.tStart) / (section.tEnd - section.tStart)
    const clampedProgress = Math.max(0, Math.min(1, rawProgress))
    
    return section.easing(clampedProgress)
  }

  getAllSectionProgress(t: number): Record<string, number> {
    const progress: Record<string, number> = {}
    
    for (const section of this._sections) {
      progress[section.id] = this.getSectionProgress(t, section.id)
    }
    
    return progress
  }
}

// Input handling for scroll/touch/keyboard
export interface InputHandler {
  onDelta: (delta: number) => void
  onTarget: (target: number) => void
}

export class ScrollInputHandler implements InputHandler {
  private _element: HTMLElement
  private _sensitivity: number
  private _isEnabled: boolean = true
  
  constructor(
    element: HTMLElement,
    public onDelta: (delta: number) => void,
    public onTarget: (target: number) => void,
    sensitivity: number = 1
  ) {
    this._element = element
    this._sensitivity = sensitivity
    this._bind()
  }

  setEnabled(enabled: boolean): void {
    this._isEnabled = enabled
  }

  destroy(): void {
    this._element.removeEventListener('wheel', this._handleWheel, { passive: false } as any)
    this._element.removeEventListener('touchstart', this._handleTouchStart, { passive: false } as any)
    this._element.removeEventListener('touchmove', this._handleTouchMove, { passive: false } as any)
    this._element.removeEventListener('keydown', this._handleKeyDown)
  }

  private _bind(): void {
    this._element.addEventListener('wheel', this._handleWheel, { passive: false })
    this._element.addEventListener('touchstart', this._handleTouchStart, { passive: false })
    this._element.addEventListener('touchmove', this._handleTouchMove, { passive: false })
    this._element.addEventListener('keydown', this._handleKeyDown)
  }

  private _touchStartY: number = 0
  
  private _handleWheel = (e: WheelEvent): void => {
    if (!this._isEnabled) return
    
    e.preventDefault()
    const delta = e.deltaY * this._sensitivity * 0.001 // Convert to progress units
    this.onDelta(delta)
  }

  private _handleTouchStart = (e: TouchEvent): void => {
    if (!this._isEnabled) return
    
    this._touchStartY = e.touches[0].clientY
  }

  private _handleTouchMove = (e: TouchEvent): void => {
    if (!this._isEnabled) return
    
    e.preventDefault()
    const currentY = e.touches[0].clientY
    const deltaY = this._touchStartY - currentY
    const delta = deltaY * this._sensitivity * 0.002 // Convert to progress units
    
    this.onDelta(delta)
    this._touchStartY = currentY
  }

  private _handleKeyDown = (e: KeyboardEvent): void => {
    if (!this._isEnabled) return
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        this.onDelta(-0.05) // 5% jump backward
        break
      case 'ArrowRight':
        e.preventDefault()
        this.onDelta(0.05) // 5% jump forward
        break
      case 'Home':
        e.preventDefault()
        this.onTarget(0)
        break
      case 'End':
        e.preventDefault()
        this.onTarget(1)
        break
    }
  }
}

// Smooth progress interpolation with momentum
export class SmoothProgress {
  private _current: number = 0
  private _target: number = 0
  private _velocity: number = 0
  private _damping: number = 0.1
  private _rafId: number | null = null
  private _isRunning: boolean = false
  private _onChange?: (t: number) => void

  constructor(
    initialValue: number = 0,
    damping: number = 0.1,
    onChange?: (t: number) => void
  ) {
    this._current = initialValue
    this._target = initialValue
    this._damping = damping
    this._onChange = onChange
  }

  get current(): number {
    return this._current
  }

  get target(): number {
    return this._target
  }

  setTarget(target: number): void {
    this._target = Math.max(0, Math.min(1, target))
    this._startAnimation()
  }

  addDelta(delta: number): void {
    this.setTarget(this._target + delta)
  }

  setCurrent(value: number): void {
    this._current = Math.max(0, Math.min(1, value))
    this._target = this._current
    this._velocity = 0
    this._stopAnimation()
    this._onChange?.(this._current)
  }

  private _startAnimation(): void {
    if (this._isRunning) return
    
    this._isRunning = true
    this._animate()
  }

  private _stopAnimation(): void {
    this._isRunning = false
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  private _animate = (): void => {
    if (!this._isRunning) return

    const diff = this._target - this._current
    
    if (Math.abs(diff) < 0.001 && Math.abs(this._velocity) < 0.001) {
      this._current = this._target
      this._velocity = 0
      this._stopAnimation()
      this._onChange?.(this._current)
      return
    }

    this._velocity += diff * this._damping
    this._velocity *= 0.95 // Friction
    this._current += this._velocity

    // Clamp to valid range
    this._current = Math.max(0, Math.min(1, this._current))

    this._onChange?.(this._current)
    this._rafId = requestAnimationFrame(this._animate)
  }
}