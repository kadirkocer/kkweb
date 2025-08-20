'use client'

import { GoldenGavel, GoldenScale, AvatarIdle, AvatarRun } from '@/components/PixelSprite'

export default function PixelTestPage() {
  return (
    <div className="min-h-screen bg-court-black p-8 space-y-8">
      <h1 className="text-3xl font-bold text-ink text-center mb-8">
        Pixel Art Test
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        <div className="bg-mid-panel/20 p-6 rounded-lg text-center">
          <h2 className="text-ink mb-4">Golden Gavel</h2>
          <div className="flex justify-center">
            <GoldenGavel scale={4} />
          </div>
        </div>
        
        <div className="bg-mid-panel/20 p-6 rounded-lg text-center">
          <h2 className="text-ink mb-4">Golden Scale</h2>
          <div className="flex justify-center">
            <GoldenScale scale={4} />
          </div>
        </div>
        
        <div className="bg-mid-panel/20 p-6 rounded-lg text-center">
          <h2 className="text-ink mb-4">Avatar Idle</h2>
          <div className="flex justify-center">
            <AvatarIdle scale={4} />
          </div>
        </div>
        
        <div className="bg-mid-panel/20 p-6 rounded-lg text-center">
          <h2 className="text-ink mb-4">Avatar Run</h2>
          <div className="flex justify-center">
            <AvatarRun scale={4} />
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <h2 className="text-xl text-ink mb-4">Different Scales</h2>
        <div className="flex items-end justify-center gap-4">
          <div className="text-center">
            <p className="text-muted text-sm mb-2">Scale 1x</p>
            <GoldenGavel scale={1} />
          </div>
          <div className="text-center">
            <p className="text-muted text-sm mb-2">Scale 2x</p>
            <GoldenGavel scale={2} />
          </div>
          <div className="text-center">
            <p className="text-muted text-sm mb-2">Scale 3x</p>
            <GoldenGavel scale={3} />
          </div>
          <div className="text-center">
            <p className="text-muted text-sm mb-2">Scale 4x</p>
            <GoldenGavel scale={4} />
          </div>
          <div className="text-center">
            <p className="text-muted text-sm mb-2">Scale 6x</p>
            <GoldenGavel scale={6} />
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-muted">
          <a href="/interactive" className="text-gold hover:underline">
            ← Back to Interactive Portfolio
          </a>
        </p>
      </div>
    </div>
  )
}
