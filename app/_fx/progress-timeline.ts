'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Core animation state management
interface TimelineState { 
  t: number; 
  section: string; 
  speed: number; 
  isAnimating: boolean; 
  targetT: number; 
  setT: (t: number) => void; 
  animateToT: (targetT: number, duration?: number) => void; 
  setSection: (section: string) => void; 
  snapToSection: (sectionId: string) => void; 
}

// Input event types for normalized handling
interface InputEvent {
  type: 'wheel' | 'touch' | 'keyboard' | 'programmatic';
  delta: number;
  timestamp: number;
  target?: number;
}

// RAF animation producer for 60fps consistency
class AnimationProducer {
  private _rafId: number | null = null;
  private _isRunning: boolean = false;
  private _callbacks: Set<(timestamp: number) => void> = new Set();
  private _lastTimestamp: number = 0;

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this._tick();
  }

  stop(): void {
    this._isRunning = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  subscribe(callback: (timestamp: number) => void): () => void {
    this._callbacks.add(callback);
    if (this._callbacks.size === 1) this.start();
    
    return () => {
      this._callbacks.delete(callback);
      if (this._callbacks.size === 0) this.stop();
    };
  }

  private _tick = (timestamp: number = performance.now()): void => {
    if (!this._isRunning) return;

    // Ensure minimum frame time for consistency (16.67ms = 60fps)
    if (timestamp - this._lastTimestamp >= 16.67) {
      this._callbacks.forEach(callback => callback(timestamp));
      this._lastTimestamp = timestamp;
    }

    this._rafId = requestAnimationFrame(this._tick);
  };
}

// Shared animation producer instance
const animationProducer = new AnimationProducer();

// Input event queue with normalization
class InputQueue {
  private _queue: InputEvent[] = [];
  private _processingScheduled: boolean = false;
  private _onInput?: (event: InputEvent) => void;

  constructor(onInput?: (event: InputEvent) => void) {
    this._onInput = onInput;
  }

  push(event: InputEvent): void {
    // Normalize delta based on input type
    const normalizedEvent: InputEvent = {
      ...event,
      delta: this._normalizeDelta(event)
    };

    this._queue.push(normalizedEvent);
    this._scheduleProcessing();
  }

  private _normalizeDelta(event: InputEvent): number {
    switch (event.type) {
      case 'wheel':
        // Wheel events: normalize to progress units (0-1)
        return event.delta * 0.001;
      case 'touch':
        // Touch events: normalize based on viewport
        return event.delta * 0.002;
      case 'keyboard':
        // Keyboard: fixed jump amounts
        return event.delta; // Already normalized
      case 'programmatic':
        // Direct progress values
        return event.delta;
      default:
        return event.delta;
    }
  }

  private _scheduleProcessing(): void {
    if (this._processingScheduled) return;
    this._processingScheduled = true;
    
    requestAnimationFrame(() => {
      this._processQueue();
      this._processingScheduled = false;
    });
  }

  private _processQueue(): void {
    if (this._queue.length === 0) return;

    // Batch similar events within frame
    const batched = this._batchEvents();
    batched.forEach(event => this._onInput?.(event));
    this._queue.length = 0;
  }

  private _batchEvents(): InputEvent[] {
    if (this._queue.length <= 1) return this._queue;

    const batched: Map<string, InputEvent> = new Map();
    
    for (const event of this._queue) {
      const key = event.type + (event.target !== undefined ? '_target' : '_delta');
      const existing = batched.get(key);
      
      if (existing && event.target === undefined) {
        // Accumulate deltas
        existing.delta += event.delta;
        existing.timestamp = Math.max(existing.timestamp, event.timestamp);
      } else {
        // Use latest target or create new entry
        batched.set(key, { ...event });
      }
    }

    return Array.from(batched.values());
  }
}

// Enhanced smooth progress interpolation with momentum and RAF
class SmoothProgress {
  private _current: number = 0;
  private _target: number = 0;
  private _velocity: number = 0;
  private _damping: number = 0.12;
  private _friction: number = 0.85;
  private _unsubscribe?: () => void;
  private _onChange?: (t: number) => void;
  private _isActive: boolean = false;

  constructor(
    initialValue: number = 0,
    damping: number = 0.12,
    onChange?: (t: number) => void
  ) {
    this._current = initialValue;
    this._target = initialValue;
    this._damping = damping;
    this._onChange = onChange;
  }

  get current(): number {
    return this._current;
  }

  get target(): number {
    return this._target;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  setTarget(target: number): void {
    this._target = Math.max(0, Math.min(1, target));
    this._startAnimation();
  }

  addDelta(delta: number): void {
    this.setTarget(this._target + delta);
  }

  setCurrent(value: number, stopAnimation: boolean = true): void {
    this._current = Math.max(0, Math.min(1, value));
    if (stopAnimation) {
      this._target = this._current;
      this._velocity = 0;
      this._stopAnimation();
    }
    this._onChange?.(this._current);
  }

  destroy(): void {
    this._stopAnimation();
  }

  private _startAnimation(): void {
    if (this._isActive) return;
    
    this._isActive = true;
    this._unsubscribe = animationProducer.subscribe(this._animate);
  }

  private _stopAnimation(): void {
    this._isActive = false;
    this._unsubscribe?.();
    this._unsubscribe = undefined;
  }

  private _animate = (timestamp: number): void => {
    if (!this._isActive) return;

    const diff = this._target - this._current;
    
    // Stop animation if close enough
    if (Math.abs(diff) < 0.001 && Math.abs(this._velocity) < 0.001) {
      this._current = this._target;
      this._velocity = 0;
      this._stopAnimation();
      this._onChange?.(this._current);
      return;
    }

    // Spring physics with damping
    this._velocity += diff * this._damping;
    this._velocity *= this._friction;
    this._current += this._velocity;

    // Clamp to valid range
    this._current = Math.max(0, Math.min(1, this._current));

    this._onChange?.(this._current);
  };
}

// Performance-optimized input handlers
class PerformantInputHandler {
  private _element: HTMLElement;
  private _inputQueue: InputQueue;
  private _smoothProgress: SmoothProgress;
  private _isEnabled: boolean = true;
  private _listeners: Array<{ element: HTMLElement; event: string; handler: any; options?: any }> = [];

  constructor(
    element: HTMLElement,
    onProgress: (t: number) => void,
    damping: number = 0.12
  ) {
    this._element = element;
    this._smoothProgress = new SmoothProgress(0, damping, onProgress);
    this._inputQueue = new InputQueue(this._handleInput);
    this._bind();
  }

  setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
  }

  destroy(): void {
    this._unbind();
    this._smoothProgress.destroy();
  }

  private _bind(): void {
    this._addListener(this._element, 'wheel', this._handleWheel, { passive: false });
    this._addListener(this._element, 'touchstart', this._handleTouchStart, { passive: false });
    this._addListener(this._element, 'touchmove', this._handleTouchMove, { passive: false });
    this._addListener(window, 'keydown', this._handleKeyDown);
  }

  private _unbind(): void {
    this._listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this._listeners.length = 0;
  }

  private _addListener(element: HTMLElement | Window, event: string, handler: any, options?: any): void {
    element.addEventListener(event, handler, options);
    this._listeners.push({ element: element as HTMLElement, event, handler, options });
  }

  private _touchStartY: number = 0;

  private _handleWheel = (e: WheelEvent): void => {
    if (!this._isEnabled) return;
    
    e.preventDefault();
    this._inputQueue.push({
      type: 'wheel',
      delta: e.deltaY,
      timestamp: performance.now()
    });
  };

  private _handleTouchStart = (e: TouchEvent): void => {
    if (!this._isEnabled) return;
    this._touchStartY = e.touches[0].clientY;
  };

  private _handleTouchMove = (e: TouchEvent): void => {
    if (!this._isEnabled) return;
    
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    const deltaY = this._touchStartY - currentY;
    
    this._inputQueue.push({
      type: 'touch',
      delta: deltaY,
      timestamp: performance.now()
    });
    
    this._touchStartY = currentY;
  };

  private _handleKeyDown = (e: KeyboardEvent): void => {
    if (!this._isEnabled) return;
    
    let delta: number | undefined;
    let target: number | undefined;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        delta = -0.05;
        break;
      case 'ArrowRight':
        e.preventDefault();
        delta = 0.05;
        break;
      case 'Home':
        e.preventDefault();
        target = 0;
        break;
      case 'End':
        e.preventDefault();
        target = 1;
        break;
      default:
        return;
    }

    this._inputQueue.push({
      type: 'keyboard',
      delta: delta || 0,
      target,
      timestamp: performance.now()
    });
  };

  private _handleInput = (event: InputEvent): void => {
    if (event.target !== undefined) {
      this._smoothProgress.setTarget(event.target);
    } else {
      this._smoothProgress.addDelta(event.delta);
    }
  };
}

const SECTIONS = [
  { id: 'intro', tStart: 0.00, tEnd: 0.12 },
  { id: 'skills', tStart: 0.12, tEnd: 0.34 },
  { id: 'experience', tStart: 0.34, tEnd: 0.58 },
  { id: 'awards', tStart: 0.58, tEnd: 0.72 },
  { id: 'work', tStart: 0.72, tEnd: 0.88 },
  { id: 'contact', tStart: 0.88, tEnd: 1.00 }
];

export const useTimeline = create<TimelineState>()(
  subscribeWithSelector((set, get) => ({
    t: 0, 
    section: 'intro', 
    speed: 1, 
    isAnimating: false, 
    targetT: 0,
    
    setT: (t) => { 
      const clamped = Math.max(0, Math.min(1, t)); 
      const section = SECTIONS.find(s => clamped >= s.tStart && clamped <= s.tEnd); 
      set({ t: clamped, section: section?.id || 'intro' }); 
    },
    
    animateToT: (targetT, duration = 1000) => { 
      const startT = get().t; 
      const startTime = performance.now(); 
      set({ isAnimating: true, targetT }); 
      
      const step = (now: number) => { 
        const progress = Math.min((now - startTime) / duration, 1); 
        const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2; 
        const newT = startT + (targetT - startT) * eased; 
        get().setT(newT); 
        
        if (progress < 1) {
          requestAnimationFrame(step); 
        } else {
          set({ isAnimating: false }); 
        }
      }; 
      
      requestAnimationFrame(step); 
    },
    
    setSection: (section) => set({ section }),
    
    snapToSection: (id) => { 
      const section = SECTIONS.find(s => s.id === id); 
      if (section) get().animateToT(section.tStart); 
    }
  }))
);

export { SECTIONS, AnimationProducer, InputQueue, SmoothProgress, PerformantInputHandler };

// Backward compatibility interfaces and classes
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

// Optimized easing functions
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
  private _unsubscribe?: () => void
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
    this._unsubscribe = animationProducer.subscribe(this._tick)
  }

  stop(): void {
    if (!this._isRunning) return
    
    this._isRunning = false
    this._unsubscribe?.()
    this._unsubscribe = undefined
  }

  setProgress(t: number): void {
    this._t = Math.max(0, Math.min(1, t))
    this._config.onProgress(this._t)
    
    if (this._t >= 1 && this._config.onComplete) {
      this._config.onComplete()
    }
  }

  private _tick = (timestamp: number): void => {
    if (!this._isRunning) return

    const now = timestamp
    const elapsed = now - this._startTime
    const duration = this._config.duration || 1000
    
    const newT = Math.min(elapsed / duration, 1)
    this.setProgress(newT)
    
    if (newT >= 1) {
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

// Legacy input handler for backward compatibility
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
    const delta = e.deltaY * this._sensitivity * 0.001
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
    const delta = deltaY * this._sensitivity * 0.002
    
    this.onDelta(delta)
    this._touchStartY = currentY
  }

  private _handleKeyDown = (e: KeyboardEvent): void => {
    if (!this._isEnabled) return
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        this.onDelta(-0.05)
        break
      case 'ArrowRight':
        e.preventDefault()
        this.onDelta(0.05)
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