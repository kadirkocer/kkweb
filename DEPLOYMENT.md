# KKWeb Deployment Guide

## Court × Street × Pixel Architecture

This deployment guide covers the production deployment of the KKWeb interactive portfolio with enhanced security, performance optimizations, and observability.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Environment variables configured (see `.env.example`)
- Admin credentials set
- Storage backend configured

## Environment Configuration

### Required Environment Variables

```bash
# Security (Required)
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password_here
REVALIDATE_TOKEN=your_secret_revalidation_token

# Storage Configuration
CONTENT_STORAGE=MEMORY  # For production
# CONTENT_STORAGE=FILE   # For development only

# Rate Limiting
RATE_LIMIT=10rps

# Observability
METRICS_ENABLED=true
METRICS_BASIC=1
TELEMETRY_DISABLED=false
```

### Optional Production Variables

```bash
# Advanced Security
FORCE_HTTPS=true
SECURE_COOKIES=true

# Performance
ENABLE_COMPRESSION=true
CACHE_CONTROL_MAX_AGE=31536000

# Theme Configuration
PIXEL_SCALE=2
PARALLAX_ENABLED=true
```

## Deployment Platforms

### Vercel (Recommended)

1. **Environment Variables**
   ```bash
   vercel env add ADMIN_USERNAME
   vercel env add ADMIN_PASSWORD
   vercel env add REVALIDATE_TOKEN
   vercel env add METRICS_ENABLED
   ```

2. **Vercel Configuration** (`vercel.json`)
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "regions": ["iad1"],
     "functions": {
       "app/api/metrics/route.ts": {
         "maxDuration": 10
       }
     },
     "headers": [
       {
         "source": "/pixel/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Build application
   FROM base AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Docker Compose** (`docker-compose.yml`)
   ```yaml
   version: '3.8'
   services:
     kkweb:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - ADMIN_USERNAME=${ADMIN_USERNAME}
         - ADMIN_PASSWORD=${ADMIN_PASSWORD}
         - METRICS_ENABLED=true
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

## Security Configuration

### Basic Auth Protection

Admin routes (`/admin`, `/api/admin/*`) require Basic Authentication:
- Username: `ADMIN_USERNAME`
- Password: `ADMIN_PASSWORD`

### Rate Limiting

API endpoints are protected with token bucket rate limiting:
- Default: 10 requests per second
- Configurable via `RATE_LIMIT` environment variable
- Format: `{number}rps` (e.g., `RATE_LIMIT=20rps`)

### Metrics Protection

Metrics endpoint (`/api/metrics`) security:
- Production: Requires `METRICS_ENABLED=true`
- Optional Basic Auth: Set `METRICS_BASIC=1`
- Returns 404 when disabled

## Performance Optimization

### ISR Configuration

- **Static Generation**: Published pages generated at build time
- **Revalidation**: 60-second revalidation window  
- **On-Demand**: Triggered after content publish via API

### Asset Optimization

```bash
# Build optimization
npm run build -- --experimental-app-dir
npm run analyze  # Bundle analysis

# Image optimization
npm install sharp  # For production image optimization
```

### Caching Strategy

```nginx
# Nginx configuration for static assets
location /pixel/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Monitoring & Observability

### Health Checks

Available endpoints:
- `/api/health` - System health and status
- `/api/metrics` - Prometheus metrics (if enabled)
- `/api/telemetry` - Web vitals and error tracking

### Prometheus Integration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'kkweb'
    static_configs:
      - targets: ['your-domain.com']
    basic_auth:
      username: 'admin_username'
      password: 'admin_password'
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

### Grafana Dashboard

Key metrics to monitor:
- Response time (`kkweb_http_request_duration_seconds`)
- Request count (`kkweb_http_requests_total`)
- Error rates (`kkweb_render_errors_total`)
- Memory usage (`process_resident_memory_bytes`)

## Interactive Experience Deployment

### Pixel Art Assets

Ensure all required pixel art assets are present:
```bash
# Check asset structure
ls -la public/pixel/
# Should contain:
# - atlas.json
# - sprites.json
# - README.md
# - Generated WebP files
```

### Font Loading

Pixel fonts are loaded via Google Fonts:
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" as="style">
```

### Progressive Enhancement

The interactive experience gracefully degrades:
- **Full Experience**: Modern browsers with JS enabled
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Fallback**: Traditional navigation for screen readers

## Content Management

### Development Workflow

```bash
# Use FILE storage in development
export CONTENT_STORAGE=FILE

# Content files stored in /data directory
# Gitignored to prevent sensitive data leaks
```

### Production Content

```bash
# Use MEMORY storage in production
export CONTENT_STORAGE=MEMORY

# Write operations return 501 Not Implemented
# Use admin panel for content updates
```

## Troubleshooting

### Common Issues

1. **Metrics Not Working**
   ```bash
   # Check prometheus client installation
   npm list prom-client
   
   # Verify environment variables
   echo $METRICS_ENABLED
   ```

2. **Admin Panel 401 Errors**
   ```bash
   # Verify credentials are set
   echo $ADMIN_USERNAME
   echo $ADMIN_PASSWORD
   ```

3. **Interactive Page Not Loading**
   ```bash
   # Check browser console for errors
   # Verify pixel art assets exist
   # Test with reduced motion enabled
   ```

### Debug Mode

Enable debug features:
```bash
export DEBUG_MODE=true
export DEBUG_STORAGE=true

# Access debug controls
# Navigate to /interactive
# Press Cmd+D to toggle debug panel
```

### Performance Issues

```bash
# Check bundle size
npm run analyze

# Monitor metrics
curl http://localhost:3000/api/health

# Profile animations
# Use browser DevTools Performance tab
```

## Backup & Recovery

### Content Backup

```bash
# Development file-based backup
cp -r data/ backup/$(date +%Y%m%d-%H%M%S)/

# Production API backup
curl -u admin:password http://your-domain.com/api/admin/export > backup.json
```

### Version Recovery

```bash
# View version history
curl -u admin:password http://your-domain.com/api/admin/versions?pageId=page-slug

# Restore from version
curl -X POST -u admin:password \
  -H "Content-Type: application/json" \
  -d '{"pageId":"page-slug","action":"restore","versionId":"version-id"}' \
  http://your-domain.com/api/admin/versions
```

## Security Checklist

- [ ] Environment variables secured and not in repository
- [ ] Admin credentials use strong passwords
- [ ] Rate limiting configured and tested
- [ ] HTTPS enforced in production
- [ ] Metrics endpoint protected
- [ ] Content storage set to MEMORY in production
- [ ] Regular security updates scheduled

## Final Deployment Steps

1. **Pre-deployment Testing**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

2. **Environment Verification**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/api/health
   
   # Test admin access
   curl -u username:password http://localhost:3000/admin
   ```

3. **Post-deployment Verification**
   ```bash
   # Test main site
   curl -I https://your-domain.com
   
   # Test interactive experience
   curl -I https://your-domain.com/interactive
   
   # Verify metrics
   curl -u username:password https://your-domain.com/api/metrics
   ```

4. **Monitoring Setup**
   - Configure health check alerts
   - Set up error tracking
   - Enable performance monitoring

The deployment maintains the Court × Street × Pixel aesthetic while ensuring production-grade security, performance, and observability.