interface Metric {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp: number
}

export class MetricsCollector {
  private static metrics: Metric[] = []
  private static maxMetrics = 1000

  static record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      tags,
      timestamp: Date.now()
    }

    this.metrics.push(metric)
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  static increment(name: string, tags?: Record<string, string>): void {
    this.record(name, 1, tags)
  }

  static timing(name: string, duration: number, tags?: Record<string, string>): void {
    this.record(`${name}.duration`, duration, tags)
  }

  static getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return [...this.metrics]
  }

  static getAggregated(name: string): { count: number; avg: number; min: number; max: number } | null {
    const filtered = this.getMetrics(name)
    if (filtered.length === 0) return null

    const values = filtered.map(m => m.value)
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  static clear(): void {
    this.metrics = []
  }
}