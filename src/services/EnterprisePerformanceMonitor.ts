import { EnterpriseLogger } from './EnterpriseLogger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  context?: Record<string, any>
}

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export class EnterprisePerformanceMonitor {
  private static instance: EnterprisePerformanceMonitor
  private logger = EnterpriseLogger.getInstance()
  private metrics: PerformanceMetric[] = []
  private webVitals: WebVitalsMetric[] = []
  private observers: PerformanceObserver[] = []

  private constructor() {
    this.initializeObservers()
  }

  static getInstance(): EnterprisePerformanceMonitor {
    if (!EnterprisePerformanceMonitor.instance) {
      EnterprisePerformanceMonitor.instance = new EnterprisePerformanceMonitor()
    }
    return EnterprisePerformanceMonitor.instance
  }

  private initializeObservers(): void {
    // Long Task Observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('long-task', entry.duration, 'ms', {
              startTime: entry.startTime,
              name: entry.name
            })
            
            if (entry.duration > 50) {
              this.logger.warn('Long task detected', {
                duration: entry.duration,
                startTime: entry.startTime
              }, 'Performance', 'LongTask')
            }
          })
        })
        
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        this.logger.debug('Long task observer not supported')
      }

      // Navigation Observer
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric('navigation-load-complete', navEntry.loadEventEnd - navEntry.fetchStart, 'ms')
            this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart, 'ms')
            this.recordMetric('first-byte', navEntry.responseStart - navEntry.fetchStart, 'ms')
          })
        })
        
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)
      } catch (e) {
        this.logger.debug('Navigation observer not supported')
      }

      // Resource Observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const resourceEntry = entry as PerformanceResourceTiming
            if (resourceEntry.duration > 1000) { // Log slow resources
              this.logger.warn('Slow resource detected', {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize
              }, 'Performance', 'SlowResource')
            }
          })
        })
        
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        this.logger.debug('Resource observer not supported')
      }
    }
  }

  recordMetric(name: string, value: number, unit: string, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context
    }

    this.metrics.push(metric)
    this.logger.debug(`Performance metric recorded: ${name}`, metric, 'Performance', 'Metric')

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  recordWebVital(metric: WebVitalsMetric): void {
    this.webVitals.push(metric)
    
    const level = metric.rating === 'good' ? 'info' : metric.rating === 'needs-improvement' ? 'warn' : 'error'
    this.logger[level](`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating
    }, 'Performance', 'WebVital')
  }

  startTimer(operation: string): () => void {
    const startTime = performance.now()
    const startMark = `${operation}-start`
    const endMark = `${operation}-end`
    const measureName = `${operation}-duration`

    performance.mark(startMark)

    return () => {
      performance.mark(endMark)
      performance.measure(measureName, startMark, endMark)
      
      // const measure = performance.getEntriesByName(measureName)[0]
      const duration = performance.now() - startTime

      this.recordMetric(operation, duration, 'ms', {
        startTime,
        endTime: performance.now()
      })

      // Clean up marks and measures
      performance.clearMarks(startMark)
      performance.clearMarks(endMark)
      performance.clearMeasures(measureName)

      return duration
    }
  }

  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string
  ): T {
    return ((...args: Parameters<T>) => {
      const endTimer = this.startTimer(name)
      try {
        const result = fn(...args)
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.finally(() => {
            endTimer()
          })
        }
        
        endTimer()
        return result
      } catch (error) {
        endTimer()
        throw error
      }
    }) as T
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name)
    }
    return [...this.metrics]
  }

  getWebVitals(): WebVitalsMetric[] {
    return [...this.webVitals]
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return null
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  getPerformanceReport(): {
    metrics: PerformanceMetric[]
    webVitals: WebVitalsMetric[]
    summary: Record<string, any>
  } {
    const summary = {
      totalMetrics: this.metrics.length,
      totalWebVitals: this.webVitals.length,
      averages: {} as Record<string, number>,
      webVitalsSummary: {} as Record<string, any>
    }

    // Calculate averages for common metrics
    const commonMetrics = ['navigation-load-complete', 'dom-content-loaded', 'first-byte']
    commonMetrics.forEach(metric => {
      const avg = this.getAverageMetric(metric)
      if (avg !== null) {
        summary.averages[metric] = Math.round(avg * 100) / 100
      }
    })

    // Web vitals summary
    this.webVitals.forEach(vital => {
      if (!summary.webVitalsSummary[vital.name]) {
        summary.webVitalsSummary[vital.name] = {
          latest: vital.value,
          rating: vital.rating
        }
      }
    })

    return {
      metrics: this.metrics,
      webVitals: this.webVitals,
      summary
    }
  }

  exportReport(): string {
    return JSON.stringify(this.getPerformanceReport(), null, 2)
  }

  clearMetrics(): void {
    this.metrics = []
    this.webVitals = []
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.clearMetrics()
  }
}