# MIGRATION GUIDE

## Next.js 14 Security Hardening & Pixel Art Side-Scroller

This guide covers migrating to the new security-hardened architecture with Basic Auth, rate limiting, ISR/SSG support, and the court × street × pixel side-scrolling experience.

## 🔧 Required Environment Setup

### 1. Metrics Protection
The metrics endpoint is now protected in production:

```bash
# Required for metrics access in production
METRICS_ENABLED=true

# Optional: Protect metrics with Basic Auth
METRICS_BASIC=1
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
```

### 2. Admin Authentication
All admin APIs now require Basic Auth:

```bash
# Required for admin panel access
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
```

### 3. Rate Limiting Configuration
Optionally configure API rate limits:

```bash
# Default: 10 requests per second
RATE_LIMIT=10rps

# For higher traffic:
RATE_LIMIT=50rps
```

### 4. Content Storage
For development with file-based storage:

```bash
CONTENT_STORAGE=FILE
```

## 📁 Current Storage Architecture

The project uses a storage adapter pattern located in `lib/storage.ts`:

### Development: FileStorage
- **Environment**: `CONTENT_STORAGE=FILE`
- **Storage**: Local JSON files in `./data/` directory
- **Use case**: Development and local testing

### Production: NoopStorage (Default)
- **Environment**: `CONTENT_STORAGE` not set or any other value
- **Behavior**: Returns structured 501 responses with `{ code: 'NOT_IMPLEMENTED' }`
- **Use case**: Production safety (prevents file system writes on serverless)

## Storage Interface

```typescript
export interface StorageAdapter {
  get<T>(key: string): Promise<T>
  set<T>(key: string, data: T): Promise<void>
}
```

### Current Data Keys
- `projects` - Project portfolio items
- `experience` - Work experience entries
- `social` - Social media links
- `embeds` - Social media embed configurations
- `pages` - Dynamic pages with block content (NEW in v2.0.0)
- `page_versions` - Version history for published pages (NEW in v2.0.0)

## 🎨 New Theme System Migration

### CSS Variables
Import the new theme system in your app:

```typescript
// app/layout.tsx
import '@/styles/theme.css'
```

### Tailwind Updates
The Tailwind config now includes theme tokens:

```typescript
// Colors are now available as classes:
className="bg-court-black text-ink border-gold"

// Grid-based spacing:
className="p-grid-4 gap-grid-2"

// Theme-aware utilities:
className="pixel-crisp box-mark stencil-label"
```

## 🎮 Side-Scroller Integration

### Using the Stage Component
Replace your main layout with the new Stage system:

```tsx
import { Stage } from '@/app/_ui/Stage'
import { IntroScene, SkillsScene } from '@/app/_scenes'

export default function HomePage() {
  return (
    <Stage>
      <IntroScene />
      <SkillsScene />
      {/* Add other scenes */}
    </Stage>
  )
}
```

### Scene Creation
Create new scenes using the SceneBase:

```tsx
import { SceneBase, SceneConfig } from '@/app/_scenes/SceneBase'

const mySceneConfig: SceneConfig = {
  id: 'my-scene',
  title: 'My Scene',
  background: {
    color: 'var(--court-black)',
    texture: '/textures/grain.png',
  },
  pixelArt: {
    sprites: [
      {
        id: 'my-sprite',
        src: '/pixel/my-sprite.png',
        width: 16,
        height: 16,
      }
    ]
  }
}

export function MyScene() {
  return (
    <SceneBase config={mySceneConfig}>
      {/* Your content */}
    </SceneBase>
  )
}
```

## 📄 Page Management & Versioning

### ISR/SSG Configuration
Published pages now use ISR with 60-second revalidation:

```typescript
// Automatically applied to app/[slug]/page.tsx
export const revalidate = 60
export const dynamic = 'auto'
```

### Preview Mode
Draft pages can be previewed:

```bash
# Preview draft content
https://yoursite.com/my-page?draft=1

# Or preview parameter
https://yoursite.com/my-page?preview=true
```

### Version History
Existing pages will automatically generate version history on next publish:

1. **No action needed** - versioning starts with next publish
2. **Historical versions** - Only new versions are tracked
3. **Rollback capability** - Restore any version to draft state

## 🔒 Security Updates

### Admin Panel Access
All admin endpoints now require authentication:

```bash
# Set credentials in environment
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password-here

# Access admin panel - browser will prompt for credentials
# Or use API directly:
curl -u admin:password /api/admin/pages
```

### Rate Limiting
Admin APIs are rate-limited by IP:

- **Default**: 10 requests per second
- **Burst capacity**: 10x rate limit
- **429 responses** include Retry-After header
- **Configure with**: `RATE_LIMIT=20rps`

## 📊 Observability & Monitoring

### Health Checks
The health endpoint now provides comprehensive status:

```bash
curl /api/health
# Returns: status, uptime, storage, features, performance
```

### Metrics Access
In production, metrics require explicit enabling:

```bash
# Development (always accessible)
curl /api/metrics

# Production (requires METRICS_ENABLED=true)
curl /api/metrics
# With Basic Auth if METRICS_BASIC=1:
curl -u username:password /api/metrics
```

## 🖼️ Pixel Art Assets

### Asset Structure
Create the following directory structure:

```
public/
├── pixel/
│   ├── atlas.webp      # Main sprite sheet (512x512 recommended)
│   ├── atlas.json      # Sprite coordinates and metadata
│   └── individual/     # Individual sprite files
└── textures/
    └── grain.png       # 100x100px noise texture
```

### Atlas Format
Use this JSON format for sprite atlases:

```json
{
  "meta": {
    "app": "kkweb-pixel-atlas",
    "version": "1.0",
    "image": "atlas.webp",
    "size": { "w": 512, "h": 512 },
    "scale": "2"
  },
  "frames": {
    "sprite-name": {
      "frame": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 16, "h": 16 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 16, "h": 16 }
    }
  }
}
```

## Adding Real Database Support

### 1. Create a Database Storage Implementation

```typescript
// lib/storage/database-storage.ts
import { StorageAdapter } from '../storage'

export class DatabaseStorage implements StorageAdapter {
  async get<T>(key: string): Promise<T> {
    // Implement your database read logic
    // Example: return await db.collection(key).findMany()
  }

  async set<T>(key: string, data: T): Promise<void> {
    // Implement your database write logic  
    // Example: await db.collection(key).deleteMany(); await db.collection(key).createMany(data)
  }
}
```

### 2. Update Storage Factory

Modify `lib/storage.ts`:

```typescript
import { DatabaseStorage } from './storage/database-storage'

export function getStorage(): StorageAdapter {
  if (process.env.CONTENT_STORAGE === 'FILE') {
    return new FileStorage()
  }
  
  if (process.env.CONTENT_STORAGE === 'DATABASE') {
    return new DatabaseStorage()
  }
  
  // Add more storage types as needed
  if (process.env.CONTENT_STORAGE === 'REDIS') {
    return new RedisStorage()
  }
  
  return new NoopStorage()
}
```

### 3. Environment Configuration

Add database connection details to your environment:

```bash
# .env.local (development)
CONTENT_STORAGE=DATABASE
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# .env (production)
CONTENT_STORAGE=DATABASE
DATABASE_URL=your_production_database_url
```

## Database Implementation Examples

### Supabase Integration

```typescript
import { createClient } from '@supabase/supabase-js'

export class SupabaseStorage implements StorageAdapter {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  async get<T>(key: string): Promise<T> {
    const { data, error } = await this.supabase
      .from('content')
      .select('data')
      .eq('key', key)
      .single()
    
    if (error) throw new Error(`Failed to get ${key}: ${error.message}`)
    return data.data
  }

  async set<T>(key: string, data: T): Promise<void> {
    const { error } = await this.supabase
      .from('content')
      .upsert({ key, data }, { onConflict: 'key' })
    
    if (error) throw new Error(`Failed to set ${key}: ${error.message}`)
  }
}
```

### Redis/KV Integration

```typescript
import { Redis } from '@upstash/redis'

export class RedisStorage implements StorageAdapter {
  private redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  async get<T>(key: string): Promise<T> {
    const data = await this.redis.get(key)
    if (!data) throw new Error(`Key ${key} not found`)
    return data as T
  }

  async set<T>(key: string, data: T): Promise<void> {
    await this.redis.set(key, data)
  }
}
```

### Prisma Integration

```typescript
import { PrismaClient } from '@prisma/client'

export class PrismaStorage implements StorageAdapter {
  private prisma = new PrismaClient()

  async get<T>(key: string): Promise<T> {
    const record = await this.prisma.content.findUnique({
      where: { key }
    })
    
    if (!record) throw new Error(`Key ${key} not found`)
    return JSON.parse(record.data) as T
  }

  async set<T>(key: string, data: T): Promise<void> {
    await this.prisma.content.upsert({
      where: { key },
      update: { data: JSON.stringify(data) },
      create: { key, data: JSON.stringify(data) }
    })
  }
}
```

## Data Structure Reference

Current JSON files structure:

```json
// data/projects.json
[
  {
    "id": "unique-id",
    "title": "Project Title",
    "description": "Description",
    "image": "/images/project.jpg",
    "technologies": ["Next.js", "TypeScript"],
    "github": "https://github.com/...",
    "demo": "https://demo.url",
    "featured": true,
    "year": 2024
  }
]
```

## Migration Steps

1. **Backup Current Data**: Copy your `data/` directory
2. **Set Up Database**: Create schema and insert initial data  
3. **Implement Storage Adapter**: Create your database implementation
4. **Test Migration**: Test locally with `CONTENT_STORAGE=DATABASE`
5. **Deploy**: Update production environment variables

## Error Handling

Your storage implementation should handle errors gracefully and return structured responses matching the current API contract.

---

This adapter pattern allows you to start with simple file storage and migrate to any database solution without changing the rest of your application code.