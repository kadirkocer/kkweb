import { promises as fs } from 'fs'
import { join } from 'path'

export interface StorageAdapter {
  get<T>(key: string): Promise<T>
  set<T>(key: string, data: T): Promise<void>
}

export class FileStorage implements StorageAdapter {
  private dataDir = join(process.cwd(), 'data')

  async get<T>(key: string): Promise<T> {
    const filePath = join(this.dataDir, `${key}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  }

  async set<T>(key: string, data: T): Promise<void> {
    const filePath = join(this.dataDir, `${key}.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  }
}

export class NoopStorage implements StorageAdapter {
  async get<T>(_key: string): Promise<T> {
    throw new Error('Storage not implemented')
  }

  async set<T>(_key: string, _data: T): Promise<void> {
    throw new Error('Storage not implemented')
  }
}

// Factory function to get the appropriate storage instance
export function getStorage(): StorageAdapter {
  if (process.env.CONTENT_STORAGE === 'FILE') {
    return new FileStorage()
  }
  return new NoopStorage()
}

// Standard error format for storage operations
export function createStorageError(operation: string, cause: string) {
  return {
    error: 'NOT_IMPLEMENTED',
    message: `Storage operation '${operation}' is not available in production. ${cause}`,
    code: 'NOT_IMPLEMENTED'
  }
}