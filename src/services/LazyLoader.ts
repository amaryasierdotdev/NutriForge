export class LazyLoader {
  private static loadedModules = new Map<string, any>()
  private static loadingPromises = new Map<string, Promise<any>>()

  static async loadModule<T>(moduleFactory: () => Promise<T>, key: string): Promise<T> {
    if (this.loadedModules.has(key)) {
      return this.loadedModules.get(key)
    }

    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)
    }

    const loadingPromise = moduleFactory().then(module => {
      this.loadedModules.set(key, module)
      this.loadingPromises.delete(key)
      return module
    })

    this.loadingPromises.set(key, loadingPromise)
    return loadingPromise
  }

  static preload<T>(moduleFactory: () => Promise<T>, key: string): void {
    if (!this.loadedModules.has(key) && !this.loadingPromises.has(key)) {
      this.loadModule(moduleFactory, key)
    }
  }

  static clearCache(): void {
    this.loadedModules.clear()
    this.loadingPromises.clear()
  }
}