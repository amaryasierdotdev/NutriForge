interface AppConfiguration {
  theme: 'light' | 'dark' | 'auto'
  language: string
  exportFormats: string[]
  advancedMode: boolean
  notifications: boolean
  autoSave: boolean
}

export class ConfigManager {
  private static config: AppConfiguration = {
    theme: 'dark',
    language: 'en',
    exportFormats: ['JSON', 'CSV', 'XML', 'PDF'],
    advancedMode: false,
    notifications: true,
    autoSave: true
  }

  static get<K extends keyof AppConfiguration>(key: K): AppConfiguration[K] {
    return this.config[key]
  }

  static set<K extends keyof AppConfiguration>(key: K, value: AppConfiguration[K]): void {
    this.config[key] = value
    this.saveToStorage()
  }

  static getAll(): AppConfiguration {
    return { ...this.config }
  }

  static reset(): void {
    this.config = {
      theme: 'dark',
      language: 'en',
      exportFormats: ['JSON', 'CSV', 'XML', 'PDF'],
      advancedMode: false,
      notifications: true,
      autoSave: true,
    }
    this.saveToStorage()
  }

  private static saveToStorage(): void {
    try {
      localStorage.setItem('app-config', JSON.stringify(this.config))
    } catch (error) {
      // Handle localStorage save error silently
    }
  }

  static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('app-config')
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) }
      }
    } catch (error) {
      // Handle localStorage load error silently
    }
  }
}