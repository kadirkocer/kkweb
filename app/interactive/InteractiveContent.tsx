'use client'

import { Suspense, lazy } from 'react'
import { Stage } from '@/app/_ui/Stage'
import { IntroScene } from '@/app/_scenes/intro.scene'
import { SkillsScene } from '@/app/_scenes/skills.scene'

// Lazy scenes
const ExperienceScene = lazy(() => import('@/app/_scenes/experience.scene').then(m => ({ default: m.ExperienceScene })))
const AwardsScene = lazy(() => import('@/app/_scenes/awards.scene').then(m => ({ default: m.AwardsScene })))
const WorkScene = lazy(() => import('@/app/_scenes/work.scene').then(m => ({ default: m.WorkScene })))
const ContactScene = lazy(() => import('@/app/_scenes/contact.scene').then(m => ({ default: m.ContactScene })))

function SceneLoading({ sceneId }: { sceneId: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-muted text-sm">Loading {sceneId}...</p>
      </div>
    </div>
  )
}

export function InteractiveContent() {
  return (
    <>
      {/* Pixel styles & overflow control */}
      <style jsx global>{`
        html, body { margin:0; padding:0; overflow:hidden; background: var(--court-black); }
        #__next { height:100vh; overflow:hidden; }
        img[src*="/pixel/"] { image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; }
      `}</style>

      <Stage className="font-body antialiased" totalScenes={6}>
        {/* intro */}
        <div id="scene-intro" className="absolute top-0 w-screen h-full" style={{ left: '0vw' }}>
          <Suspense fallback={<SceneLoading sceneId="intro" />}> <IntroScene /> </Suspense>
        </div>
        {/* skills */}
        <div id="scene-skills" className="absolute top-0 w-screen h-full" style={{ left: '100vw' }}>
          <Suspense fallback={<SceneLoading sceneId="skills" />}> <SkillsScene /> </Suspense>
        </div>
        {/* experience */}
        <div id="scene-experience" className="absolute top-0 w-screen h-full" style={{ left: '200vw' }}>
          <Suspense fallback={<SceneLoading sceneId="experience" />}> <ExperienceScene /> </Suspense>
        </div>
        {/* awards */}
        <div id="scene-awards" className="absolute top-0 w-screen h-full" style={{ left: '300vw' }}>
          <Suspense fallback={<SceneLoading sceneId="awards" />}> <AwardsScene /> </Suspense>
        </div>
        {/* work */}
        <div id="scene-work" className="absolute top-0 w-screen h-full" style={{ left: '400vw' }}>
          <Suspense fallback={<SceneLoading sceneId="work" />}> <WorkScene /> </Suspense>
        </div>
        {/* contact */}
        <div id="scene-contact" className="absolute top-0 w-screen h-full" style={{ left: '500vw' }}>
          <Suspense fallback={<SceneLoading sceneId="contact" />}> <ContactScene /> </Suspense>
        </div>
      </Stage>
    </>
  )
}
