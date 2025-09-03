export interface AuditEvent {
  id: string
  timestamp: string
  userId?: string
  sessionId: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  outcome: 'success' | 'failure' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class EnterpriseAuditService {
  private static instance: EnterpriseAuditService
  private auditLog: AuditEvent[] = []
  private maxLogSize = 10000
  private sessionId: string

  private constructor() {
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): EnterpriseAuditService {
    if (!EnterpriseAuditService.instance) {
      EnterpriseAuditService.instance = new EnterpriseAuditService()
    }
    return EnterpriseAuditService.instance
  }

  private generateSessionId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  logEvent(
    action: string,
    resource: string,
    details: Record<string, any> = {},
    outcome: 'success' | 'failure' | 'warning' = 'success',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      action,
      resource,
      details: this.sanitizeDetails(details),
      userAgent: navigator.userAgent,
      outcome,
      severity
    }

    this.auditLog.push(event)

    // Maintain log size
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxLogSize)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // Logging disabled
    }

    // Send to external audit system in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAuditSystem(event)
    }
  }

  // Specific audit methods
  logUserAction(action: string, details: Record<string, any> = {}): void {
    this.logEvent(action, 'user_interface', details, 'success', 'low')
  }

  logDataAccess(resource: string, details: Record<string, any> = {}): void {
    this.logEvent('data_access', resource, details, 'success', 'medium')
  }

  logCalculation(metrics: any, results: any): void {
    this.logEvent('calculation_performed', 'nutrition_calculator', {
      inputMetrics: this.sanitizeMetrics(metrics),
      hasResults: !!results,
      calculationTime: Date.now()
    }, 'success', 'medium')
  }

  logExport(format: string, dataSize: number): void {
    this.logEvent('data_export', 'calculation_results', {
      format,
      dataSize,
      exportTime: Date.now()
    }, 'success', 'high')
  }

  logSecurityEvent(event: string, details: Record<string, any> = {}): void {
    this.logEvent(event, 'security', details, 'warning', 'high')
  }

  logError(error: Error, context: Record<string, any> = {}): void {
    this.logEvent('application_error', 'system', {
      errorMessage: error.message,
      errorStack: error.stack,
      context
    }, 'failure', 'critical')
  }

  logPerformanceIssue(metric: string, value: number, threshold: number): void {
    this.logEvent('performance_issue', 'system', {
      metric,
      value,
      threshold,
      severity: value > threshold * 2 ? 'critical' : 'high'
    }, 'warning', value > threshold * 2 ? 'critical' : 'high')
  }

  // Query audit log
  getEvents(filter?: {
    action?: string
    resource?: string
    outcome?: string
    severity?: string
    startTime?: string
    endTime?: string
  }): AuditEvent[] {
    let events = [...this.auditLog]

    if (filter) {
      events = events.filter(event => {
        if (filter.action && event.action !== filter.action) return false
        if (filter.resource && event.resource !== filter.resource) return false
        if (filter.outcome && event.outcome !== filter.outcome) return false
        if (filter.severity && event.severity !== filter.severity) return false
        if (filter.startTime && event.timestamp < filter.startTime) return false
        if (filter.endTime && event.timestamp > filter.endTime) return false
        return true
      })
    }

    return events
  }

  // Generate audit report
  generateReport(timeRange?: { start: string; end: string }): {
    summary: Record<string, number>
    events: AuditEvent[]
    recommendations: string[]
  } {
    const events = timeRange 
      ? this.getEvents({ startTime: timeRange.start, endTime: timeRange.end })
      : this.auditLog

    const summary = {
      totalEvents: events.length,
      successEvents: events.filter(e => e.outcome === 'success').length,
      failureEvents: events.filter(e => e.outcome === 'failure').length,
      warningEvents: events.filter(e => e.outcome === 'warning').length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highSeverityEvents: events.filter(e => e.severity === 'high').length
    }

    const recommendations = this.generateRecommendations(summary, events)

    return { summary, events, recommendations }
  }

  private generateRecommendations(summary: Record<string, number>, events: AuditEvent[]): string[] {
    const recommendations: string[] = []

    if (summary.failureEvents > summary.totalEvents * 0.1) {
      recommendations.push('High failure rate detected. Review error handling and user experience.')
    }

    if (summary.criticalEvents > 0) {
      recommendations.push('Critical events detected. Immediate attention required.')
    }

    const securityEvents = events.filter(e => e.resource === 'security')
    if (securityEvents.length > 10) {
      recommendations.push('Multiple security events detected. Review security measures.')
    }

    return recommendations
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details }
    
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'credential']
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]'
      }
    })

    return sanitized
  }

  private sanitizeMetrics(metrics: any): any {
    return {
      gender: metrics.gender,
      hasWeight: !!metrics.weight,
      hasHeight: !!metrics.height,
      hasAge: !!metrics.age,
      activityLevel: metrics.activityLevel,
      hasBodyFat: !!metrics.bodyFatPercentage
    }
  }

  private async sendToAuditSystem(event: AuditEvent): Promise<void> {
    try {
      // In a real implementation, this would send to an external audit system
      // For now, we'll just store it locally
      const auditData = JSON.stringify(event)
      localStorage.setItem(`audit_${event.id}`, auditData)
    } catch (error) {
      // Error logging disabled
    }
  }

  // Export audit log
  exportAuditLog(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      events: this.auditLog
    }, null, 2)
  }

  // Clear audit log (admin function)
  clearAuditLog(): void {
    this.logEvent('audit_log_cleared', 'audit_system', {}, 'success', 'high')
    this.auditLog = []
  }
}