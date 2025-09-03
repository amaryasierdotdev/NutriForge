interface CacheEntry {
  value: string
  timestamp: number
  hits: number
}

export class TranslationCache {
  private static cache = new Map<string, CacheEntry>()
  private static maxSize = 1000
  private static ttl = 24 * 60 * 60 * 1000 // 24 hours

  static get(key: string): string | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update hit count
    entry.hits++
    return entry.value
  }

  static set(key: string, value: string): void {
    // Clean cache if too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    })
  }

  static has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null
  }

  private static cleanup(): void {
    // Remove least recently used entries
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.hits - b.hits)
    
    const toRemove = Math.floor(this.maxSize * 0.3)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  static clear(): void {
    this.cache.clear()
  }

  static getStats(): { size: number; maxSize: number; hitRate: number } {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const hitRate = entries.length > 0 ? totalHits / entries.length : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate
    }
  }
}