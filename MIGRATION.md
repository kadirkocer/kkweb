# Migration Guide

This document explains how to extend the current storage adapter system to integrate with real databases or key-value stores for production use.

## Current Architecture

The project uses a storage adapter pattern located in `lib/storage.ts` that provides two implementations:

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