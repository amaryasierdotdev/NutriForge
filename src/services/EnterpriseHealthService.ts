import { EnterpriseConfigService } from './EnterpriseConfig'
import { EnterpriseCacheService } from './EnterpriseCacheService'
import { EnterprisePerformanceMonitor } from './EnterprisePerformanceMonitor'

export interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  message: string
  timestamp: string
  responseTime?: number
  details?: Record<string, any>
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  checks: HealthCheck[]
  uptime: number
  version: string
  environment: string
}

export class EnterpriseHealthService {
  private static instance: EnterpriseHealthService
  private config = EnterpriseConfigService.getInstance()
  private cache = EnterpriseCacheService.getInstance()
  private performance = EnterprisePerformanceMonitor.getInstance()
  private startTime = Date.now()

  private constructor() {}

  static getInstance(): EnterpriseHealthService {
    if (!EnterpriseHealthService.instance) {
      EnterpriseHealthService.instance = new EnterpriseHealthService()
    }
    return EnterpriseHealthService.instance
  }

  async performHealthCheck(): Promise<SystemHealth> {
    const checks: HealthCheck[] = []

    // Memory usage check
    checks.push(await this.checkMemoryUsage())
    
    // Performance check
    checks.push(await this.checkPerformance())
    
    // Cache health check
    checks.push(await this.checkCacheHealth())
    
    // Configuration check
    checks.push(await this.checkConfiguration())
    
    // Browser compatibility check
    checks.push(await this.checkBrowserCompatibility())

    // Determine overall health
    const criticalCount = checks.filter(c => c.status === 'critical').length
    const warningCount = checks.filter(c => c.status === 'warning').length
    
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (criticalCount > 0) {
      overall = 'critical'
    } else if (warningCount > 0) {
      overall = 'warning'
    }

    const appInfo = this.config.getAppInfo()

    return {
      overall,
      checks,
      uptime: Date.now() - this.startTime,
      version: appInfo.version,
      environment: appInfo.environment
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    const start = performance.now()
    
    try {
      // Check if performance.memory is available (Chrome)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)
        
        const usagePercent = (usedMB / limitMB) * 100
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy'
        let message = `Memory usage: ${usedMB}MB / ${limitMB}MB (${usagePercent.toFixed(1)}%)`
        
        if (usagePercent > 90) {
          status = 'critical'
          message += ' - Critical memory usage'
        } else if (usagePercent > 75) {
          status = 'warning'
          message += ' - High memory usage'
        }
        
        return {
          name: 'memory_usage',
          status,
          message,
          timestamp: new Date().toISOString(),
          responseTime: performance.now() - start,
          details: { usedMB, totalMB, limitMB, usagePercent }
        }
      } else {
        return {
          name: 'memory_usage',
          status: 'warning',
          message: 'Memory monitoring not available in this browser',
          timestamp: new Date().toISOString(),
          responseTime: performance.now() - start
        }
      }
    } catch (error) {
      return {
        name: 'memory_usage',
        status: 'critical',
        message: `Memory check failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start
      }
    }
  }

  private async checkPerformance(): Promise<HealthCheck> {
    const start = performance.now()
    
    try {
      const webVitals = this.performance.getWebVitals()
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      const issues: string[] = []
      
      // Check Web Vitals
      webVitals.forEach(vital => {
        if (vital.rating === 'poor') {
          issues.push(`${vital.name}: ${vital.value} (poor)`)
          status = 'critical'
        } else if (vital.rating === 'needs-improvement') {
          issues.push(`${vital.name}: ${vital.value} (needs improvement)`)
          if (status === 'healthy') status = 'warning'
        }
      })
      
      const message = issues.length > 0 
        ? `Performance issues detected: ${issues.join(', ')}`
        : 'All performance metrics are healthy'
      
      return {
        name: 'performance',
        status,
        message,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start,
        details: { webVitals: webVitals.length, issues: issues.length }
      }
    } catch (error) {
      return {
        name: 'performance',
        status: 'critical',
        message: `Performance check failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start
      }
    }
  }

  private async checkCacheHealth(): Promise<HealthCheck> {
    const start = performance.now()
    
    try {
      const cacheStats = this.cache.getStats()
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      let message = `Cache: ${cacheStats.size}/${cacheStats.maxSize} entries, ${cacheStats.hitRate.toFixed(1)}% hit rate`
      
      if (cacheStats.hitRate < 50) {
        status = 'warning'
        message += ' - Low hit rate'
      }
      
      if (cacheStats.size > cacheStats.maxSize * 0.9) {
        status = 'warning'
        message += ' - Cache nearly full'
      }
      
      return {
        name: 'cache_health',
        status,
        message,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start,
        details: cacheStats
      }
    } catch (error) {
      return {
        name: 'cache_health',
        status: 'critical',
        message: `Cache check failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start
      }
    }
  }

  private async checkConfiguration(): Promise<HealthCheck> {
    const start = performance.now()
    
    try {
      const config = this.config.getConfig()
      const issues: string[] = []
      
      // Check critical configurations
      if (!config.features.enablePerformanceMonitoring) {
        issues.push('Performance monitoring disabled')
      }
      
      if (config.app.environment === 'production' && !config.features.enableErrorReporting) {
        issues.push('Error reporting disabled in production')
      }
      
      const status = issues.length > 0 ? 'warning' : 'healthy'
      const message = issues.length > 0 
        ? `Configuration issues: ${issues.join(', ')}`
        : 'Configuration is healthy'
      
      return {
        name: 'configuration',
        status,
        message,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start,
        details: { issues: issues.length, environment: config.app.environment }
      }
    } catch (error) {
      return {
        name: 'configuration',
        status: 'critical',
        message: `Configuration check failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start
      }
    }
  }

  private async checkBrowserCompatibility(): Promise<HealthCheck> {
    const start = performance.now()
    
    try {
      const issues: string[] = []
      
      // Check for required APIs
      if (!('localStorage' in window)) {
        issues.push('localStorage not supported')
      }
      
      if (!('fetch' in window)) {
        issues.push('fetch API not supported')
      }
      
      if (!('Promise' in window)) {
        issues.push('Promises not supported')
      }
      
      if (!('Map' in window)) {
        issues.push('Map not supported')
      }
      
      // Check for modern features
      if (!('IntersectionObserver' in window)) {
        issues.push('IntersectionObserver not supported')
      }
      
      const status = issues.length > 2 ? 'critical' : issues.length > 0 ? 'warning' : 'healthy'
      const message = issues.length > 0 
        ? `Browser compatibility issues: ${issues.join(', ')}`
        : 'Browser is fully compatible'
      
      return {
        name: 'browser_compatibility',
        status,
        message,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start,
        details: { 
          userAgent: navigator.userAgent,
          issues: issues.length,
          criticalIssues: issues.filter(i => i.includes('localStorage') || i.includes('fetch')).length
        }
      }
    } catch (error) {
      return {
        name: 'browser_compatibility',
        status: 'critical',
        message: `Browser compatibility check failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        responseTime: performance.now() - start
      }
    }
  }

  // Quick health status for monitoring
  async getQuickStatus(): Promise<'healthy' | 'warning' | 'critical'> {
    try {
      const health = await this.performHealthCheck()
      return health.overall
    } catch {
      return 'critical'
    }
  }

  // Export health report
  async exportHealthReport(): Promise<string> {
    const health = await this.performHealthCheck()
    return JSON.stringify(health, null, 2)
  }
}