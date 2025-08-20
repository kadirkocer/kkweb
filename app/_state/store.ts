'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface ViewportInfo {
  width: number
  height: number
  pixelRatio: number
}

export interface SideScrollerState {
  // Progress and timeline
  t: number
  targetT: number
  section: string | null
  sectionProgress: Record<string, number>
  
  // Animation settings
  speed: number
  isAnimating: boolean
  isPaused: boolean
  
  // Viewport and rendering
  viewport: ViewportInfo
  worldWidth: number
  
  // Input and interaction
  inputMode: 'mouse' | 'touch' | 'keyboard'
  isScrolling: boolean
  
  // Accessibility and preferences
  reducedMotion: boolean
  enableSound: boolean
  debugMode: boolean
  
  // Scene management
  activeScenes: Set<string>
  loadedAssets: Set<string>
}

export interface SideScrollerActions {
  // Progress control
  setT: (t: number) => void
  setTargetT: (targetT: number) => void
  addDelta: (delta: number) => void
  
  // Section management
  setSection: (section: string | null) => void
  setSectionProgress: (sectionId: string, progress: number) => void
  updateAllSectionProgress: (progress: Record<string, number>) => void
  
  // Animation control
  play: () => void
  pause: () => void
  setSpeed: (speed: number) => void
  
  // Viewport updates
  updateViewport: (viewport: ViewportInfo) => void
  setWorldWidth: (width: number) => void
  
  // Input state
  setInputMode: (mode: 'mouse' | 'touch' | 'keyboard') => void
  setScrolling: (isScrolling: boolean) => void
  
  // Preferences
  setReducedMotion: (reduced: boolean) => void
  setEnableSound: (enabled: boolean) => void
  toggleDebugMode: () => void
  
  // Scene management
  activateScene: (sceneId: string) => void
  deactivateScene: (sceneId: string) => void
  markAssetLoaded: (assetId: string) => void
  
  // Utility actions
  reset: () => void
  jumpToSection: (sectionId: string) => void
}

type SideScrollerStore = SideScrollerState & SideScrollerActions

const initialState: SideScrollerState = {
  t: 0,
  targetT: 0,
  section: null,
  sectionProgress: {},
  
  speed: 1,
  isAnimating: false,
  isPaused: false,
  
  viewport: {
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  },
  worldWidth: 5000, // 500vw
  
  inputMode: 'mouse',
  isScrolling: false,
  
  reducedMotion: typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false,
  enableSound: true,
  debugMode: false,
  
  activeScenes: new Set(),
  loadedAssets: new Set(),
}

// Scene configuration matching the spec
export const SCENES = [
  { id: 'intro', tStart: 0.00, tEnd: 0.12, easing: 'cubic' },
  { id: 'skills', tStart: 0.12, tEnd: 0.34, easing: 'quadOut' },
  { id: 'experience', tStart: 0.34, tEnd: 0.58, easing: 'quadInOut' },
  { id: 'awards', tStart: 0.58, tEnd: 0.72, easing: 'backOut' },
  { id: 'work', tStart: 0.72, tEnd: 0.88, easing: 'cubic' },
  { id: 'contact', tStart: 0.88, tEnd: 1.00, easing: 'cubic' },
] as const

export const useSideScrollerStore = create<SideScrollerStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Progress control
    setT: (t: number) => set(() => ({ t: Math.max(0, Math.min(1, t)) })),
    
    setTargetT: (targetT: number) => 
      set(() => ({ targetT: Math.max(0, Math.min(1, targetT)) })),
    
    addDelta: (delta: number) => {
      const { targetT } = get()
      const newTargetT = Math.max(0, Math.min(1, targetT + delta))
      set(() => ({ targetT: newTargetT }))
    },

    // Section management
    setSection: (section: string | null) => set(() => ({ section })),
    
    setSectionProgress: (sectionId: string, progress: number) =>
      set((state) => ({
        sectionProgress: {
          ...state.sectionProgress,
          [sectionId]: Math.max(0, Math.min(1, progress)),
        },
      })),
    
    updateAllSectionProgress: (progress: Record<string, number>) =>
      set(() => ({ sectionProgress: progress })),

    // Animation control
    play: () => set(() => ({ isAnimating: true, isPaused: false })),
    pause: () => set(() => ({ isAnimating: false, isPaused: true })),
    setSpeed: (speed: number) => set(() => ({ speed: Math.max(0.1, Math.min(5, speed)) })),

    // Viewport updates
    updateViewport: (viewport: ViewportInfo) => set(() => ({ viewport })),
    setWorldWidth: (worldWidth: number) => set(() => ({ worldWidth })),

    // Input state
    setInputMode: (inputMode: 'mouse' | 'touch' | 'keyboard') => set(() => ({ inputMode })),
    setScrolling: (isScrolling: boolean) => set(() => ({ isScrolling })),

    // Preferences
    setReducedMotion: (reducedMotion: boolean) => set(() => ({ reducedMotion })),
    setEnableSound: (enableSound: boolean) => set(() => ({ enableSound })),
    toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),

    // Scene management
    activateScene: (sceneId: string) =>
      set((state) => ({
        activeScenes: new Set([...state.activeScenes, sceneId]),
      })),
    
    deactivateScene: (sceneId: string) => {
      const newSet = new Set(get().activeScenes)
      newSet.delete(sceneId)
      set(() => ({ activeScenes: newSet }))
    },
    
    markAssetLoaded: (assetId: string) =>
      set((state) => ({
        loadedAssets: new Set([...state.loadedAssets, assetId]),
      })),

    // Utility actions
    reset: () =>
      set(() => ({
        ...initialState,
        // Preserve user preferences
        reducedMotion: get().reducedMotion,
        enableSound: get().enableSound,
        debugMode: get().debugMode,
        viewport: get().viewport,
      })),
    
    jumpToSection: (sectionId: string) => {
      const scene = SCENES.find((s) => s.id === sectionId)
      if (scene) {
        set(() => ({
          targetT: scene.tStart,
          section: sectionId,
        }))
      }
    },
  }))
)

// Selectors for commonly used derived state
export const useCurrentSection = () =>
  useSideScrollerStore((state) => {
    const { t } = state
    return SCENES.find((scene) => t >= scene.tStart && t <= scene.tEnd) || null
  })

export const useSectionProgress = (sectionId: string) =>
  useSideScrollerStore((state) => state.sectionProgress[sectionId] || 0)

export const useIsSceneActive = (sceneId: string) =>
  useSideScrollerStore((state) => state.activeScenes.has(sceneId))

export const useIsAssetLoaded = (assetId: string) =>
  useSideScrollerStore((state) => state.loadedAssets.has(assetId))

// Hook for getting scene boundaries
export const useSceneInfo = (sceneId: string) => {
  const scene = SCENES.find((s) => s.id === sceneId)
  const t = useSideScrollerStore((state) => state.t)
  const progress = useSectionProgress(sceneId)
  
  if (!scene) return null
  
  const isActive = t >= scene.tStart && t <= scene.tEnd
  const isVisible = t >= scene.tStart - 0.1 && t <= scene.tEnd + 0.1 // Buffer for optimization
  
  return {
    ...scene,
    isActive,
    isVisible,
    progress,
  }
}

// Performance optimization: Subscribe to viewport changes
if (typeof window !== 'undefined') {
  const handleResize = () => {
    useSideScrollerStore.getState().updateViewport({
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    })
  }
  
  const handleReducedMotionChange = (e: MediaQueryListEvent) => {
    useSideScrollerStore.getState().setReducedMotion(e.matches)
  }
  
  window.addEventListener('resize', handleResize)
  
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
  
  // Cleanup function (if needed in a React component)
  if (typeof global !== 'undefined') {
    ;(global as any).__cleanupSideScrollerListeners = () => {
      window.removeEventListener('resize', handleResize)
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    }
  }
}