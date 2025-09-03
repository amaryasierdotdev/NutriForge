export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTimer(label: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(label, duration)
    }
  }

  static recordMetric(label: string, value: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(value)
  }

  static getMetrics(label: string) {
    const values = this.metrics.get(label) || []
    if (values.length === 0) return null

    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  static getAllMetrics() {
    const result: Record<string, any> = {}
    this.metrics.forEach((values, label) => {
      result[label] = this.getMetrics(label)
    })
    return result
  }

  static clearMetrics() {
    this.metrics.clear()
  }
}