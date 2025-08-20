// Export all scene components
export { IntroScene } from './intro.scene'
export { SkillsScene } from './skills.scene'

// Scene registry for dynamic loading
export const sceneRegistry = {
  intro: () => import('./intro.scene').then(m => m.IntroScene),
  skills: () => import('./skills.scene').then(m => m.SkillsScene),
  // Add other scenes as they're implemented
  experience: () => import('./skills.scene').then(m => m.SkillsScene), // Placeholder
  awards: () => import('./skills.scene').then(m => m.SkillsScene), // Placeholder
  work: () => import('./skills.scene').then(m => m.SkillsScene), // Placeholder
  contact: () => import('./skills.scene').then(m => m.SkillsScene), // Placeholder
} as const

export type SceneId = keyof typeof sceneRegistry