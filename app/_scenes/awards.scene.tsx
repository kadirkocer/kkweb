'use client'

import { SceneBase, SceneConfig } from './SceneBase'

const awardsConfig: SceneConfig = {
  id: 'awards',
  title: 'Awards & Recognition',
  background: {
    color: 'var(--court-black)',
    layers: []
  }
}

export function AwardsScene() {
  return (
    <SceneBase config={awardsConfig}>
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-ink font-display mb-4">
            AWARDS
          </h2>
          <p className="text-muted text-lg">
            Recognition and achievements coming soon...
          </p>
        </div>
      </div>
    </SceneBase>
  )
}
