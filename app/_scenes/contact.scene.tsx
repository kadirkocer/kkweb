'use client'

import { SceneBase, SceneConfig } from './SceneBase'

const contactConfig: SceneConfig = {
  id: 'contact',
  title: 'Get in Touch',
  background: {
    color: 'var(--court-black)',
    layers: []
  }
}

export function ContactScene() {
  return (
    <SceneBase config={contactConfig}>
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-ink font-display mb-4">
            CONTACT
          </h2>
          <p className="text-muted text-lg">
            Contact information coming soon...
          </p>
        </div>
      </div>
    </SceneBase>
  )
}
