import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // CSS variable-based theme tokens
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        // Theme-specific colors
        'court-black': 'var(--court-black)',
        'mid-panel': 'var(--mid-panel)',
        'ink': 'var(--ink)',
        'gold': 'var(--gold)',
        'street-red': 'var(--street-red)',
        'pixel-sky': 'var(--pixel-sky)',
        'pixel-grass': 'var(--pixel-grass)',
        'pixel-soil': 'var(--pixel-soil)',
        'line': 'var(--line)',
        'focus': 'var(--focus)',
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
        pixel: ['var(--font-pixel)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      spacing: {
        'grid-1': 'calc(var(--grid-base) * 1)',
        'grid-2': 'calc(var(--grid-base) * 2)',
        'grid-3': 'calc(var(--grid-base) * 3)',
        'grid-4': 'calc(var(--grid-base) * 4)',
        'grid-6': 'calc(var(--grid-base) * 6)',
        'grid-8': 'calc(var(--grid-base) * 8)',
        'grid-10': 'calc(var(--grid-base) * 10)',
        'grid-12': 'calc(var(--grid-base) * 12)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pixel-bounce': 'pixelBounce 0.6s ease-in-out infinite',
        'stencil-slide': 'stencilSlide 0.3s ease-out'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pixelBounce: { 
          '0%, 100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-8px)' } 
        },
        stencilSlide: { 
          '0%': { transform: 'translateX(-8px)', opacity: '0' }, 
          '100%': { transform: 'translateX(0)', opacity: '1' } 
        }
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config