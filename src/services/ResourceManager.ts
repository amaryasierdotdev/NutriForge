interface Resource {
  id: string
  data: any
  timestamp: number
  size: number
}

export class ResourceManager {
  private static resources = new Map<string, Resource>()
  private static maxSize = 50 * 1024 * 1024 // 50MB
  private static currentSize = 0

  static store(id: string, data: any): void {
    const size = this.calculateSize(data)
    
    if (this.currentSize + size > this.maxSize) {
      this.cleanup()
    }

    const resource: Resource = {
      id,
      data,
      timestamp: Date.now(),
      size
    }

    this.resources.set(id, resource)
    this.currentSize += size
  }

  static get<T>(id: string): T | null {
    const resource = this.resources.get(id)
    if (!resource) return null

    // Update access time
    resource.timestamp = Date.now()
    return resource.data as T
  }

  static remove(id: string): void {
    const resource = this.resources.get(id)
    if (resource) {
      this.currentSize -= resource.size
      this.resources.delete(id)
    }
  }

  private static cleanup(): void {
    const sorted = Array.from(this.resources.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)

    // Remove oldest 25% of resources
    const toRemove = Math.ceil(sorted.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      this.remove(sorted[i][0])
    }
  }

  private static calculateSize(data: any): number {
    return JSON.stringify(data).length * 2 // Rough estimate
  }

  static getStats() {
    return {
      count: this.resources.size,
      size: this.currentSize,
      maxSize: this.maxSize
    }
  }
}