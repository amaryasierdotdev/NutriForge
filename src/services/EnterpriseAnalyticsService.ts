interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  customDimensions?: Record<string, string>
  timestamp: number
  sessionId: string
  userId?: string
}

export class EnterpriseAnalyticsService {
  private static instance: EnterpriseAnalyticsService
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private batchSize = 10
  private flushInterval = 30000 // 30 seconds

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.startBatchProcessor()
  }

  static getInstance(): EnterpriseAnalyticsService {
    if (!EnterpriseAnalyticsService.instance) {
      EnterpriseAnalyticsService.instance = new EnterpriseAnalyticsService()
    }
    return EnterpriseAnalyticsService.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Track user interactions
  track(event: string, category: string, action: string, options?: {
    label?: string
    value?: number
    customDimensions?: Record<string, string>
  }): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label: options?.label,
      value: options?.value,
      customDimensions: options?.customDimensions,
      timestamp: Date.now(),
      sessionId: this.sessionId
    }

    this.events.push(analyticsEvent)

    if (this.events.length >= this.batchSize) {
      this.flush()
    }
  }

  // Track page views
  trackPageView(page: string, title?: string): void {
    this.track('page_view', 'Navigation', 'view', {
      label: page,
      customDimensions: { title: title || page }
    })
  }

  // Track user engagement
  trackEngagement(action: string, duration?: number): void {
    this.track('engagement', 'User', action, {
      value: duration,
      customDimensions: { 
        sessionDuration: this.getSessionDuration().toString()
      }
    })
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, category = 'Performance'): void {
    this.track('performance', category, metric, {
      value: Math.round(value),
      customDimensions: {
        userAgent: navigator.userAgent,
        connection: this.getConnectionInfo()
      }
    })
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', 'Application', 'error', {
      label: error.message,
      customDimensions: {
        stack: error.stack?.substring(0, 500) || 'No stack trace',
        context: JSON.stringify(context || {})
      }
    })
  }

  // Track business metrics
  trackCalculation(type: string, metrics: Record<string, any>): void {
    this.track('calculation', 'Business', type, {
      customDimensions: {
        gender: metrics.gender,
        activityLevel: metrics.activityLevel,
        hasBodyFat: String(!!metrics.bodyFatPercentage)
      }
    })
  }

  // Get session duration
  private getSessionDuration(): number {
    const sessionStart = parseInt(this.sessionId.split('_')[1])
    return Date.now() - sessionStart
  }

  // Get connection information
  private getConnectionInfo(): string {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      return `${conn.effectiveType || 'unknown'}_${conn.downlink || 0}mbps`
    }
    return 'unknown'
  }

  // Batch processor
  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.events.length > 0) {
        this.flush()
      }
    }, this.flushInterval)
  }

  // Flush events to analytics service
  private async flush(): Promise<void> {
    if (this.events.length === 0) return

    const batch = [...this.events]
    this.events = []

    try {
      // In production, send to analytics service
      if (process.env.NODE_ENV === 'production') {
        await this.sendToAnalytics(batch)
      } else {
        // Group logging disabled
        batch.forEach(event => {
          // Logging disabled
        })
        // Group logging disabled
      }
    } catch (error) {
      // Error logging disabled
      // Re-queue events for retry
      this.events.unshift(...batch)
    }
  }

  // Send to analytics service
  private async sendToAnalytics(events: AnalyticsEvent[]): Promise<void> {
    // Implementation would send to Google Analytics, Adobe Analytics, etc.
    const payload = {
      events,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Store locally for now
    localStorage.setItem(`analytics_${Date.now()}`, JSON.stringify(payload))
  }

  // Get analytics summary
  getAnalyticsSummary(): {
    sessionId: string
    sessionDuration: number
    eventCount: number
    pendingEvents: number
  } {
    return {
      sessionId: this.sessionId,
      sessionDuration: this.getSessionDuration(),
      eventCount: this.events.length,
      pendingEvents: this.events.length
    }
  }

  // Export analytics data
  exportAnalytics(): string {
    const summary = this.getAnalyticsSummary()
    const data = {
      summary,
      events: this.events,
      exportTime: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }
}