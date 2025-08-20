# CHANGELOG

## Security Hardening & Pixel Art Side-Scroller Implementation

### 🎨 **Theme System & Visual Identity**
- **NEW**: Complete CSS variable-based theme system with court × street × pixel design tokens
- **NEW**: Comprehensive Tailwind configuration with custom color palette and spacing
- **NEW**: Pixel art rendering utilities with crisp 2x scaling and snap-to-grid positioning
- **NEW**: Focus ring system and accessibility utilities
- **NEW**: Grain texture overlay and visual motifs (box marks, stencil labels, gold hairlines)

### ⚡ **Animation & Interaction System**
- **NEW**: RAF-based ProgressTimeline with smooth 60fps animations
- **NEW**: Comprehensive easing function library with custom curves
- **NEW**: Parallax engine with pixel-perfect transforms and layer management
- **NEW**: Input handling for scroll/touch/keyboard with reduced motion support
- **NEW**: SmoothProgress class with momentum and damping for fluid interactions

### 🎮 **Side-Scroller Presentation Layer**
- **NEW**: Stage/HUD architecture for immersive portfolio experience
- **NEW**: Zustand-based state management with viewport awareness
- **NEW**: Scene-based content organization with 6 sections (intro → contact)
- **NEW**: Interactive progress bar with section markers and deep linking
- **NEW**: Accessibility features: keyboard navigation, nudge buttons, reduced motion fallbacks
- **NEW**: Pixel sprite animation system with frame management

### 🔒 **Security & Infrastructure**
- **ENHANCED**: Metrics API protection with METRICS_ENABLED env gating
- **ENHANCED**: Optional Basic Auth protection for metrics (METRICS_BASIC=1)
- **NEW**: Admin API rate limiting with token bucket algorithm (configurable via RATE_LIMIT)
- **NEW**: Comprehensive error schema with request IDs and proper HTTP status codes
- **ENHANCED**: Basic Auth middleware for all admin endpoints with clear configuration errors

### 📊 **Observability & Monitoring**
- **ENHANCED**: Comprehensive health endpoint with feature flags and performance metrics
- **ENHANCED**: ObservabilityPanel with real-time metrics, Web Vitals, and error tracking
- **NEW**: Server-side error aggregation with counters and telemetry integration
- **NEW**: Request instrumentation with timing and failure tracking
- **NEW**: Prometheus metrics support with custom counters and histograms

### 📄 **Content Management**
- **ENHANCED**: ISR/SSG support for published pages with 60-second revalidation
- **NEW**: Version history system with visual diff comparison
- **NEW**: Rollback functionality - restore any version to draft state
- **NEW**: Comprehensive versioning API with snapshot management
- **ENHANCED**: Preview mode with draft=1 query parameter and dynamic rendering
- **ENHANCED**: Page status management with publish/unpublish workflows

### 🛠 **Developer Experience**
- **CLEANED**: Removed duplicate files and unused dev scripts
- **STREAMLINED**: Package.json with essential scripts only
- **NEW**: Debug mode with keyboard shortcuts (Cmd+R reset, Cmd+D toggle)
- **NEW**: Development-friendly error handling with detailed block validation
- **NEW**: Asset management system for pixel art with atlas JSON format
- **ENHANCED**: TypeScript strict mode with comprehensive type safety

### 📁 **File Structure Changes**
```
app/
├── _fx/          # Animation utilities (progress-timeline, parallax, easing, pixel-snap)
├── _state/       # Zustand store with scene management
├── _ui/          # Stage and HUD components
├── _scenes/      # Scene components (intro, skills, etc.)
└── api/
    ├── admin/versions/   # NEW: Version management API
    ├── metrics/          # ENHANCED: Protected metrics endpoint
    └── telemetry/        # ENHANCED: Error aggregation
components/
├── admin/
│   └── builder/
│       └── VersionHistory.tsx   # NEW: Version diff and rollback UI
└── ui/
    └── scroll-area.tsx          # NEW: Scroll area component
public/
├── pixel/        # NEW: Pixel art assets (atlas.webp, atlas.json)
└── textures/     # NEW: Texture assets (grain.png)
styles/
└── theme.css     # NEW: Complete theme system with CSS variables
```

### 🚀 **Performance Optimizations**
- **60 FPS Target**: All animations use RAF with proper frame throttling
- **CLS < 0.1**: Pixel-perfect positioning prevents layout shifts
- **ISR Caching**: Published pages served from edge cache with revalidation
- **Asset Optimization**: 2x pixel scaling with crisp rendering
- **Smart Loading**: Scene components only render when visible

### ♿ **Accessibility Features**
- **WCAG AA Compliance**: Proper focus management and keyboard navigation
- **Reduced Motion**: Complete fallback system for prefers-reduced-motion
- **Screen Reader**: Proper ARIA labels and semantic structure
- **Keyboard Navigation**: Arrow keys, Home/End shortcuts, nudge buttons
- **High Contrast**: Gold focus rings and clear visual hierarchy

### 🏗 **Architecture Improvements**
- **Serverless Compatible**: All features work on Vercel platform
- **Cookie-only i18n**: No URL prefix pollution
- **Environment Driven**: Feature flags for prod/dev configurations  
- **Storage Abstraction**: Pluggable storage with dev/prod implementations
- **Rate Limiting**: In-memory token bucket with IP-based keys

### 🔧 **Configuration**
New environment variables:
- `METRICS_ENABLED=true` - Enable Prometheus metrics endpoint
- `METRICS_BASIC=1` - Protect metrics with Basic Auth
- `RATE_LIMIT=10rps` - Configure API rate limiting
- `ADMIN_USERNAME/ADMIN_PASSWORD` - Basic Auth credentials
- `CONTENT_STORAGE=FILE` - Dev storage mode

### ⚠️ **Breaking Changes**
- Removed legacy dev manager scripts
- Updated theme CSS requires importing `/styles/theme.css`
- Admin APIs now require Basic Auth (set ADMIN_USERNAME/ADMIN_PASSWORD)
- Metrics endpoint hidden in prod unless METRICS_ENABLED=true

### 🐛 **Bug Fixes**
- Fixed duplicate provider files
- Improved error handling in admin APIs with proper HTTP status codes
- Enhanced storage error messages with actionable guidance
- Fixed ISR preview mode with proper dynamic rendering