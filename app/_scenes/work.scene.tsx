'use client'

import { SceneBase, SceneConfig } from './SceneBase'

const workConfig: SceneConfig = {
  id: 'work',
  title: 'Featured Work',
  background: {
    color: 'var(--court-black)',
    layers: []
  }
}

export function WorkScene() {
  return (
    <SceneBase config={workConfig}>
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-ink font-display mb-4">
            WORK
          </h2>
          <p className="text-muted text-lg">
            Portfolio projects coming soon...
          </p>
        </div>
      </div>
    </SceneBase>
  )
}
