interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, boolean>
  timestamp: number
}

export class HealthCheck {
  private static checks: Record<string, () => boolean> = {}

  static addCheck(name: string, checkFn: () => boolean): void {
    this.checks[name] = checkFn
  }

  static async runChecks(): Promise<HealthStatus> {
    const results: Record<string, boolean> = {}
    let healthyCount = 0

    for (const [name, checkFn] of Object.entries(this.checks)) {
      try {
        results[name] = checkFn()
        if (results[name]) healthyCount++
      } catch {
        results[name] = false
      }
    }

    const totalChecks = Object.keys(this.checks).length
    const healthRatio = totalChecks > 0 ? healthyCount / totalChecks : 1

    return {
      status: healthRatio === 1 ? 'healthy' : healthRatio > 0.5 ? 'degraded' : 'unhealthy',
      checks: results,
      timestamp: Date.now()
    }
  }

  static getStatus(): Promise<HealthStatus> {
    return this.runChecks()
  }
}