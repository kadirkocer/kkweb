# Pixel Art Assets

This directory contains pixel art assets for the KKWeb Court × Street × Pixel theme.

## File Structure

```
public/pixel/
├── README.md              # This file
├── atlas.json            # Original simple atlas
├── atlas-extended.json   # Complete sprite atlas mapping
├── sprites.json          # Animation and sprite definitions
└── [generated assets]    # Actual image files (to be created)
```

## Asset Requirements

### Character Assets (16×16 @ 2x = 32×32)
- **avatar-idle.webp** - Standing pose for Kadir avatar
- **avatar-run-{1-6}.webp** - 6-frame run cycle animation

### Collectible Assets (16×16 @ 2x = 32×32)
- **gavel.webp** - Golden gavel (legal symbol)
- **scale.webp** - Justice scales (legal symbol)
- **gem.webp** - Code gem (programming symbol)
- **tag.webp** - Street art tag (urban symbol)

### Environment Assets (Various sizes @ 2x)
- **court-pillar.webp** (32×64) - Classical courthouse pillar
- **court-wall.webp** (32×32) - Courthouse wall tile
- **court-steps.webp** (64×16) - Courthouse entrance steps
- **street-asphalt.webp** (32×32) - Street surface tile
- **street-sidewalk.webp** (32×32) - Sidewalk tile
- **street-gutter.webp** (32×16) - Street gutter/curb
- **terminal-bg.webp** (64×48) - Code terminal background
- **terminal-border.webp** (64×48) - Terminal border/frame
- **terminal-cursor.webp** (8×16) - Blinking cursor

### Background Assets (Various sizes @ 2x)
- **city-building-{1-3}.webp** - Skyline silhouettes for parallax
- **atlas.webp** - Complete sprite atlas (1024×1024)

## Design Guidelines

### Color Palette
```css
--court-black: #0B0C10    /* Primary dark */
--mid-panel: #121318      /* Secondary dark */
--ink: #F6F7FB           /* Light text */
--muted: #9AA3AF         /* Muted text */
--gold: #CBA35C          /* Court accent */
--street-red: #D61F2C    /* Street accent */
--pixel-sky: #3EC1F3     /* Sky blue */
--pixel-grass: #39B24A   /* Nature green */
--pixel-soil: #6B4F3A    /* Earth brown */
--line: #1C1D22          /* Borders */
--focus: #E4C987         /* Focus/hover */
```

### Pixel Art Rules
1. **Resolution**: Design at 1x scale, export at 2x for retina
2. **Limited Palette**: Use max 16 colors per sprite
3. **Clean Edges**: No anti-aliasing, sharp pixel boundaries
4. **Consistent Style**: Maintain 8-bit aesthetic across all assets
5. **Grid Alignment**: Align to 8px base grid in layouts

### Animation Specifications

#### Avatar Run Cycle (600ms, 6 frames)
- Frame 1: Contact (left foot forward)
- Frame 2: Recoil (both feet together)
- Frame 3: Passing (right foot forward)
- Frame 4: High point (right foot contact)
- Frame 5: Contact (right foot forward)
- Frame 6: Recoil (both feet together)

#### Collectible Animations
- **Gavel**: Gentle bounce (2s loop, ±8px)
- **Scale**: Subtle sway (3s loop, ±2px)
- **Gem**: Sparkle effect (1.5s loop)
- **Tag**: Slight wobble (2.5s loop)

## Implementation Notes

### CSS Integration
```css
.pixel-crisp {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### React Component Usage
```tsx
import { SpriteAnimator } from '@/app/_fx/parallax'

const avatar = new SpriteAnimator(element, {
  frames: 6,
  frameWidth: 32,
  frameHeight: 32,
  duration: 600,
  loop: true
})
```

### Performance Optimization
- Use WebP format with PNG fallbacks
- Combine small sprites into atlas to reduce HTTP requests
- Lazy load background elements outside viewport
- Use `will-change: transform` for animated elements

## Asset Creation Workflow

1. **Design** sprites at 1x scale using pixel art software (Aseprite, Pixaki, etc.)
2. **Export** at 2x scale for retina display support
3. **Optimize** using tools like ImageOptim or squoosh.app
4. **Test** in browser with `image-rendering: pixelated`
5. **Update** atlas.json with new sprite coordinates
6. **Commit** both source files and exported assets

## Browser Support

- **Chrome 90+**: Full support
- **Firefox 88+**: Full support  
- **Safari 14+**: Full support
- **Edge 90+**: Full support
- **Mobile**: iOS 14+, Android 10+

## Legal & Attribution

All pixel art assets are original creations for the KKWeb project. 
Colors and motifs reference legal and street art aesthetics for thematic consistency.