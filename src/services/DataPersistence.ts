interface StorageOptions {
  encrypt?: boolean
  compress?: boolean
  ttl?: number
}

export class DataPersistence {
  private static prefix = 'bodyrecomp_'

  static save<T>(key: string, data: T, options: StorageOptions = {}): boolean {
    try {
      let processedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl: options.ttl
      })

      if (options.compress) {
        processedData = this.compress(processedData)
      }

      if (options.encrypt) {
        processedData = this.encrypt(processedData)
      }

      localStorage.setItem(this.prefix + key, processedData)
      return true
    } catch (error) {
      // Error logging disabled
      return false
    }
  }

  static load<T>(key: string, options: StorageOptions = {}): T | null {
    try {
      let data = localStorage.getItem(this.prefix + key)
      if (!data) return null

      if (options.encrypt) {
        data = this.decrypt(data)
      }

      if (options.compress) {
        data = this.decompress(data)
      }

      const parsed = JSON.parse(data)
      
      // Check TTL
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        this.remove(key)
        return null
      }

      return parsed.data
    } catch (error) {
      // Error logging disabled
      return null
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  static clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key))
  }

  private static compress(data: string): string {
    // Simple compression placeholder
    return btoa(data)
  }

  private static decompress(data: string): string {
    return atob(data)
  }

  private static encrypt(data: string): string {
    // Simple encryption placeholder
    return btoa(data.split('').reverse().join(''))
  }

  private static decrypt(data: string): string {
    return atob(data).split('').reverse().join('')
  }
}