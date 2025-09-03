interface AuditEvent {
  id: string
  timestamp: number
  userId?: string
  action: string
  resource: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
}

export class AuditLogger {
  private static events: AuditEvent[] = []
  private static maxEvents = 1000
  private static listeners: Array<(event: AuditEvent) => void> = []

  static log(
    action: string,
    resource: string,
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    userId?: string
  ): void {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      userId,
      action,
      resource,
      details,
      severity,
      source: 'body-recomp-calculator'
    }

    this.events.push(event)
    
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    this.notifyListeners(event)
    
    if (severity === 'critical' || severity === 'high') {
      this.sendToRemote(event)
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private static notifyListeners(event: AuditEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        // Handle audit listener error silently
      }
    })
  }

  private static async sendToRemote(event: AuditEvent): Promise<void> {
    try {
      // In production, send to audit service
      // Send critical audit event to remote service
    } catch (error) {
      // Handle remote audit send error silently
    }
  }

  static getEvents(filter?: {
    severity?: string
    action?: string
    resource?: string
    since?: number
  }): AuditEvent[] {
    let filtered = [...this.events]

    if (filter) {
      if (filter.severity) {
        filtered = filtered.filter(e => e.severity === filter.severity)
      }
      if (filter.action) {
        filtered = filtered.filter(e => e.action.includes(filter.action!))
      }
      if (filter.resource) {
        filtered = filtered.filter(e => e.resource.includes(filter.resource!))
      }
      if (filter.since) {
        filtered = filtered.filter(e => e.timestamp >= filter.since!)
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }

  static subscribe(listener: (event: AuditEvent) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) this.listeners.splice(index, 1)
    }
  }

  static exportAuditLog(): string {
    return JSON.stringify(this.events, null, 2)
  }

  static clear(): void {
    this.events = []
  }
}