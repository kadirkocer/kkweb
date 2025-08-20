'use client'

import { GoldenGavel, AvatarIdle } from '@/components/PixelSprite'

export function SimpleTest() {
  return (
    <div className="fixed inset-0 bg-court-black text-ink flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gold">Interactive Test</h1>
        
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <p className="text-sm text-muted mb-4">Golden Gavel</p>
            <GoldenGavel scale={4} />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted mb-4">Avatar Idle</p>
            <AvatarIdle scale={4} />
          </div>
        </div>
        
        <p className="text-muted">
          If you can see the pixel art above, the PixelSprite components are working!
        </p>
      </div>
    </div>
  )
}
