import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Custom fonts can be loaded like this:
// const interFont = fetch(new URL('../../assets/Inter-Regular.woff', import.meta.url)).then(
//   (res) => res.arrayBuffer(),
// )

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract parameters with defaults
    const title = searchParams.get('title') || 'Kadir — Personal Site'
    const subtitle = searchParams.get('subtitle') || 'Law student • AI & software projects • Content & fashion'
    const type = searchParams.get('type') || 'website'
    const theme = searchParams.get('theme') || 'dark'

    // Handle different page types
    const getPageConfig = (pageType: string) => {
      switch (pageType) {
        case 'resume':
          return {
            title: 'Resume — Kadir',
            subtitle: 'Download or view my professional experience',
            emoji: '📄',
            gradient: 'from-blue-600 to-purple-600'
          }
        case 'now':
          return {
            title: 'Now — Kadir', 
            subtitle: 'What I\'m currently working on and learning',
            emoji: '🚀',
            gradient: 'from-green-600 to-blue-600'
          }
        case 'project':
          return {
            title: title,
            subtitle: 'A project by Kadir',
            emoji: '💻',
            gradient: 'from-purple-600 to-pink-600'
          }
        default:
          return {
            title: title,
            subtitle: subtitle,
            emoji: '👋',
            gradient: 'from-violet-600 to-purple-600'
          }
      }
    }

    const config = getPageConfig(type)
    const isDark = theme === 'dark'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#0b0f14' : '#ffffff',
            backgroundImage: isDark 
              ? `linear-gradient(135deg, #0b0f14 0%, #1a1f2e 50%, #0b0f14 100%)`
              : `linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)`,
            position: 'relative',
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: isDark
                ? 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
                : 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
            }}
          />

          {/* Main content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '80px',
              maxWidth: '900px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Emoji/Icon */}
            <div
              style={{
                fontSize: '80px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                background: `linear-gradient(135deg, ${config.gradient})`,
                borderRadius: '50%',
                boxShadow: isDark 
                  ? '0 20px 40px rgba(139, 92, 246, 0.3)'
                  : '0 20px 40px rgba(139, 92, 246, 0.2)',
              }}
            >
              <span style={{ color: 'white' }}>{config.emoji}</span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                background: isDark
                  ? 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)'
                  : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                margin: '0 0 24px 0',
                lineHeight: '1.1',
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              {config.title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '24px',
                color: isDark ? '#9ca3af' : '#6b7280',
                margin: '0 0 40px 0',
                lineHeight: '1.4',
                textAlign: 'center',
                maxWidth: '700px',
              }}
            >
              {config.subtitle}
            </p>

            {/* Accent line */}
            <div
              style={{
                width: '100px',
                height: '4px',
                background: `linear-gradient(135deg, ${config.gradient})`,
                borderRadius: '2px',
                marginBottom: '24px',
              }}
            />

            {/* Website URL */}
            <div
              style={{
                fontSize: '18px',
                color: isDark ? '#6b7280' : '#9ca3af',
                fontFamily: 'monospace',
              }}
            >
              kadir.dev
            </div>
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: isDark ? '#6b7280' : '#9ca3af',
              fontSize: '16px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                background: `linear-gradient(135deg, ${config.gradient})`,
                borderRadius: '50%',
              }}
            />
            <span>Kadir</span>
          </div>

          {/* Decorative elements */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '60px',
              width: '40px',
              height: '40px',
              border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '120px',
              right: '100px',
              width: '20px',
              height: '20px',
              background: `linear-gradient(135deg, ${config.gradient})`,
              borderRadius: '50%',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '150px',
              left: '80px',
              width: '16px',
              height: '16px',
              background: `linear-gradient(135deg, ${config.gradient})`,
              borderRadius: '50%',
              opacity: 0.4,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // Enable emoji support
        emoji: 'twemoji',
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0f14',
            color: 'white',
          }}
        >
          <h1 style={{ fontSize: '48px', margin: '0' }}>Kadir</h1>
          <p style={{ fontSize: '24px', margin: '16px 0 0 0', color: '#9ca3af' }}>
            Personal Site
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}