interface SystemMetrics {
  memoryUsage: number
  cpuUsage: number
  networkLatency: number
  renderTime: number
  bundleSize: number
}

export class SystemMonitor {
  private static metrics: SystemMetrics = {
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    bundleSize: 0
  }

  private static observers: Array<(metrics: SystemMetrics) => void> = []

  static startMonitoring(): void {
    this.measureMemoryUsage()
    this.measureRenderPerformance()
    this.measureNetworkLatency()
    
    setInterval(() => {
      this.updateMetrics()
      this.notifyObservers()
    }, 5000)
  }

  private static measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }
  }

  private static measureRenderPerformance(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'measure') {
          this.metrics.renderTime = entry.duration
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
  }

  private static async measureNetworkLatency(): Promise<void> {
    const start = performance.now()
    try {
      await fetch('/favicon.ico', { method: 'HEAD' })
      this.metrics.networkLatency = performance.now() - start
    } catch {
      this.metrics.networkLatency = -1
    }
  }

  private static updateMetrics(): void {
    this.measureMemoryUsage()
    this.measureNetworkLatency()
  }

  private static notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics))
  }

  static subscribe(observer: (metrics: SystemMetrics) => void): () => void {
    this.observers.push(observer)
    return () => {
      const index = this.observers.indexOf(observer)
      if (index > -1) this.observers.splice(index, 1)
    }
  }

  static getMetrics(): SystemMetrics {
    return { ...this.metrics }
  }

  static getHealthScore(): number {
    const { memoryUsage, renderTime, networkLatency } = this.metrics
    
    let score = 100
    if (memoryUsage > 50) score -= 20
    if (renderTime > 16) score -= 30
    if (networkLatency > 100) score -= 25
    
    return Math.max(0, score)
  }
}