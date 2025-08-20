// Comprehensive easing functions for smooth animations
export type EasingFunction = (t: number) => number

// Basic easing functions
export const linear = (t: number): number => t

export const quadIn = (t: number): number => t * t
export const quadOut = (t: number): number => 1 - (1 - t) * (1 - t)
export const quadInOut = (t: number): number => 
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

export const cubicIn = (t: number): number => t * t * t
export const cubicOut = (t: number): number => 1 - Math.pow(1 - t, 3)
export const cubicInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// Custom cubic for smooth progress
export const cubic = (t: number): number => 
  t * t * t * (t * (6 * t - 15) + 10)

// Back easing with overshoot
export const backOut = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export const backIn = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return c3 * t * t * t - c1 * t * t
}

export const backInOut = (t: number): number => {
  const c1 = 1.70158
  const c2 = c1 * 1.525
  
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
}

// Elastic easing
export const elasticOut = (t: number): number => {
  const c4 = (2 * Math.PI) / 3
  
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

export const elasticIn = (t: number): number => {
  const c4 = (2 * Math.PI) / 3
  
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
}

// Bounce easing
export const bounceOut = (t: number): number => {
  const n1 = 7.5625
  const d1 = 2.75
  
  if (t < 1 / d1) {
    return n1 * t * t
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}

export const bounceIn = (t: number): number => 1 - bounceOut(1 - t)

// Sine easing
export const sineIn = (t: number): number => 1 - Math.cos((t * Math.PI) / 2)
export const sineOut = (t: number): number => Math.sin((t * Math.PI) / 2)
export const sineInOut = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2

// Expo easing
export const expoIn = (t: number): number => 
  t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
export const expoOut = (t: number): number => 
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
export const expoInOut = (t: number): number =>
  t === 0
    ? 0
    : t === 1
    ? 1
    : t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2

// Circular easing
export const circIn = (t: number): number => 1 - Math.sqrt(1 - Math.pow(t, 2))
export const circOut = (t: number): number => Math.sqrt(1 - Math.pow(t - 1, 2))
export const circInOut = (t: number): number =>
  t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2

// Collection of all easing functions
export const easings = {
  linear,
  quadIn,
  quadOut,
  quadInOut,
  cubicIn,
  cubicOut,
  cubicInOut,
  cubic,
  backIn,
  backOut,
  backInOut,
  elasticIn,
  elasticOut,
  bounceIn,
  bounceOut,
  sineIn,
  sineOut,
  sineInOut,
  expoIn,
  expoOut,
  expoInOut,
  circIn,
  circOut,
  circInOut,
} as const

export type EasingName = keyof typeof easings

// Utility to get easing function by name
export function getEasing(name: EasingName): EasingFunction {
  return easings[name]
}

// Create custom cubic-bezier easing
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
  return (t: number): number => {
    // Simplified cubic-bezier approximation
    // For production use, consider using a proper cubic-bezier implementation
    const a = 1 - 3 * x2 + 3 * x1
    const b = 3 * x2 - 6 * x1
    const c = 3 * x1
    
    const x = ((a * t + b) * t + c) * t
    
    const ay = 1 - 3 * y2 + 3 * y1
    const by = 3 * y2 - 6 * y1
    const cy = 3 * y1
    
    return ((ay * x + by) * x + cy) * x
  }
}

// Easing with custom parameters
export function createBackEasing(amplitude: number = 1.70158): {
  backIn: EasingFunction
  backOut: EasingFunction
  backInOut: EasingFunction
} {
  return {
    backIn: (t: number): number => {
      const c3 = amplitude + 1
      return c3 * t * t * t - amplitude * t * t
    },
    backOut: (t: number): number => {
      const c3 = amplitude + 1
      return 1 + c3 * Math.pow(t - 1, 3) + amplitude * Math.pow(t - 1, 2)
    },
    backInOut: (t: number): number => {
      const c2 = amplitude * 1.525
      
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
    }
  }
}

// Stepped easing for pixel-perfect animations
export function steps(n: number, jumpTerm: 'jump-start' | 'jump-end' | 'jump-both' | 'jump-none' = 'jump-end'): EasingFunction {
  return (t: number): number => {
    const steps = n
    let progress = t * steps
    
    switch (jumpTerm) {
      case 'jump-start':
        progress = Math.ceil(progress)
        break
      case 'jump-end':
        progress = Math.floor(progress)
        break
      case 'jump-both':
        progress = Math.round(progress)
        break
      case 'jump-none':
        progress = t < 1 ? Math.floor(progress) : steps - 1
        break
    }
    
    return Math.min(progress / steps, 1)
  }
}