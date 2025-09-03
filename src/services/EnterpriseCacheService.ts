interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

export class EnterpriseCacheService {
  private static instance: EnterpriseCacheService
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 1000
  private defaultTTL = 300000 // 5 minutes

  private constructor() {
    this.startCleanupInterval()
  }

  static getInstance(): EnterpriseCacheService {
    if (!EnterpriseCacheService.instance) {
      EnterpriseCacheService.instance = new EnterpriseCacheService()
    }
    return EnterpriseCacheService.instance
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    const now = Date.now()
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cache calculation results
  cacheCalculation(metrics: any, results: any): void {
    const key = this.generateCalculationKey(metrics)
    this.set(key, results, 600000) // Cache for 10 minutes
  }

  getCachedCalculation(metrics: any): any | null {
    const key = this.generateCalculationKey(metrics)
    return this.get(key)
  }

  private generateCalculationKey(metrics: any): string {
    return `calc_${JSON.stringify(metrics)}`
  }

  // LRU eviction
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute
  }

  // Cache statistics
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: string
  } {
    let totalAccess = 0
    let totalHits = 0

    this.cache.forEach(entry => {
      totalAccess += entry.accessCount
      if (entry.accessCount > 0) totalHits++
    })

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccess > 0 ? (totalHits / totalAccess) * 100 : 0,
      memoryUsage: `${Math.round(this.cache.size * 0.1)}KB` // Rough estimate
    }
  }

  // Memoization decorator
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ): T {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : `memo_${JSON.stringify(args)}`
      
      let result = this.get<ReturnType<T>>(key)
      
      if (result === null) {
        result = fn(...args)
        this.set(key, result, ttl)
      }
      
      return result
    }) as T
  }
}