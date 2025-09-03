export class CacheService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static set(key: string, data: any, ttl: number = 300000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  static get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  static clear() {
    this.cache.clear()
  }
}