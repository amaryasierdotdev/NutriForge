interface IntegrationConfig {
  id: string
  name: string
  type: 'webhook' | 'api' | 'database' | 'file' | 'queue'
  endpoint: string
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'apikey'
    credentials?: Record<string, string>
  }
  enabled: boolean
  retryPolicy: {
    maxRetries: number
    backoffMs: number
    exponential: boolean
  }
}

interface IntegrationEvent {
  id: string
  integrationId: string
  eventType: string
  payload: any
  timestamp: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  attempts: number
  error?: string
}

export class EnterpriseIntegrationService {
  private static instance: EnterpriseIntegrationService
  private integrations: Map<string, IntegrationConfig> = new Map()
  private eventQueue: IntegrationEvent[] = []
  private isProcessing = false

  private constructor() {
    this.initializeIntegrations()
    this.startEventProcessor()
  }

  static getInstance(): EnterpriseIntegrationService {
    if (!EnterpriseIntegrationService.instance) {
      EnterpriseIntegrationService.instance = new EnterpriseIntegrationService()
    }
    return EnterpriseIntegrationService.instance
  }

  private initializeIntegrations(): void {
    // CRM Integration
    this.integrations.set('crm', {
      id: 'crm',
      name: 'Customer Relationship Management',
      type: 'api',
      endpoint: 'https://api.crm.com/v1',
      authentication: {
        type: 'bearer',
        credentials: { token: process.env.REACT_APP_CRM_TOKEN || '' }
      },
      enabled: true,
      retryPolicy: { maxRetries: 3, backoffMs: 1000, exponential: true }
    })

    // Analytics Platform
    this.integrations.set('analytics', {
      id: 'analytics',
      name: 'Analytics Platform',
      type: 'webhook',
      endpoint: 'https://analytics.nutriforge.com/webhook',
      authentication: {
        type: 'apikey',
        credentials: { key: process.env.REACT_APP_ANALYTICS_KEY || '' }
      },
      enabled: true,
      retryPolicy: { maxRetries: 5, backoffMs: 500, exponential: true }
    })

    // Health Records System
    this.integrations.set('ehr', {
      id: 'ehr',
      name: 'Electronic Health Records',
      type: 'api',
      endpoint: 'https://ehr.healthcare.com/fhir/r4',
      authentication: {
        type: 'oauth2',
        credentials: { 
          clientId: process.env.REACT_APP_EHR_CLIENT_ID || '',
          clientSecret: process.env.REACT_APP_EHR_CLIENT_SECRET || ''
        }
      },
      enabled: false, // Disabled by default for privacy
      retryPolicy: { maxRetries: 2, backoffMs: 2000, exponential: false }
    })

    // Notification Service
    this.integrations.set('notifications', {
      id: 'notifications',
      name: 'Push Notification Service',
      type: 'api',
      endpoint: 'https://fcm.googleapis.com/fcm/send',
      authentication: {
        type: 'bearer',
        credentials: { token: process.env.REACT_APP_FCM_TOKEN || '' }
      },
      enabled: true,
      retryPolicy: { maxRetries: 3, backoffMs: 1000, exponential: true }
    })
  }

  // Send data to integrations
  async sendToIntegration(integrationId: string, eventType: string, payload: any): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (!integration || !integration.enabled) {
      return
    }

    const event: IntegrationEvent = {
      id: this.generateEventId(),
      integrationId,
      eventType,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      attempts: 0
    }

    this.eventQueue.push(event)
  }

  // Process event queue
  private async startEventProcessor(): Promise<void> {
    setInterval(async () => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        await this.processEvents()
      }
    }, 1000)
  }

  private async processEvents(): Promise<void> {
    this.isProcessing = true

    const pendingEvents = this.eventQueue.filter(e => e.status === 'pending')
    
    for (const event of pendingEvents) {
      await this.processEvent(event)
    }

    // Clean up completed events
    this.eventQueue = this.eventQueue.filter(e => 
      e.status === 'pending' || e.status === 'processing'
    )

    this.isProcessing = false
  }

  private async processEvent(event: IntegrationEvent): Promise<void> {
    const integration = this.integrations.get(event.integrationId)
    if (!integration) return

    event.status = 'processing'
    event.attempts++

    try {
      await this.executeIntegration(integration, event)
      event.status = 'success'
    } catch (error) {
      event.error = (error as Error).message
      
      if (event.attempts >= integration.retryPolicy.maxRetries) {
        event.status = 'failed'
      } else {
        event.status = 'pending'
        // Schedule retry with backoff
        const delay = integration.retryPolicy.exponential
          ? integration.retryPolicy.backoffMs * Math.pow(2, event.attempts - 1)
          : integration.retryPolicy.backoffMs
        
        setTimeout(() => {
          // Event will be retried in next processing cycle
        }, delay)
      }
    }
  }

  private async executeIntegration(integration: IntegrationConfig, event: IntegrationEvent): Promise<void> {
    const headers = this.buildHeaders(integration)
    const payload = this.transformPayload(integration, event)

    switch (integration.type) {
      case 'webhook':
        await this.sendWebhook(integration.endpoint, payload, headers)
        break
      case 'api':
        await this.sendAPIRequest(integration.endpoint, payload, headers, event.eventType)
        break
      default:
        throw new Error(`Unsupported integration type: ${integration.type}`)
    }
  }

  private buildHeaders(integration: IntegrationConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'NutriForge-Pro/1.0.0'
    }

    switch (integration.authentication.type) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${integration.authentication.credentials?.token}`
        break
      case 'apikey':
        headers['X-API-Key'] = integration.authentication.credentials?.key || ''
        break
      case 'basic':
        const credentials = btoa(`${integration.authentication.credentials?.username}:${integration.authentication.credentials?.password}`)
        headers['Authorization'] = `Basic ${credentials}`
        break
    }

    return headers
  }

  private transformPayload(integration: IntegrationConfig, event: IntegrationEvent): any {
    const basePayload = {
      source: 'NutriForge Pro',
      timestamp: event.timestamp,
      eventType: event.eventType,
      eventId: event.id
    }

    switch (integration.id) {
      case 'crm':
        return this.transformForCRM(event.payload, basePayload)
      case 'analytics':
        return this.transformForAnalytics(event.payload, basePayload)
      case 'ehr':
        return this.transformForEHR(event.payload, basePayload)
      case 'notifications':
        return this.transformForNotifications(event.payload, basePayload)
      default:
        return { ...basePayload, data: event.payload }
    }
  }

  private transformForCRM(payload: any, base: any): any {
    return {
      ...base,
      contact: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        source: 'NutriForge Pro',
        tags: ['nutrition-client']
      },
      activity: {
        type: 'calculation',
        description: 'Completed nutrition calculation',
        date: new Date().toISOString()
      }
    }
  }

  private transformForAnalytics(payload: any, base: any): any {
    return {
      ...base,
      userId: payload.userId,
      sessionId: payload.sessionId,
      properties: {
        gender: payload.gender,
        ageGroup: this.getAgeGroup(payload.age),
        activityLevel: payload.activityLevel,
        calculationType: payload.calculationType
      }
    }
  }

  private transformForEHR(payload: any, base: any): any {
    // FHIR R4 Observation format
    return {
      resourceType: 'Observation',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '33747-0',
          display: 'Body composition analysis'
        }]
      },
      subject: {
        reference: `Patient/${payload.patientId}`
      },
      effectiveDateTime: new Date().toISOString(),
      component: [
        {
          code: { coding: [{ code: 'BMI', display: 'Body Mass Index' }] },
          valueQuantity: { value: payload.bmi, unit: 'kg/m2' }
        },
        {
          code: { coding: [{ code: 'BMR', display: 'Basal Metabolic Rate' }] },
          valueQuantity: { value: payload.bmr, unit: 'kcal/day' }
        }
      ]
    }
  }

  private transformForNotifications(payload: any, base: any): any {
    return {
      to: payload.deviceToken,
      notification: {
        title: payload.title,
        body: payload.message,
        icon: '/favicon.ico'
      },
      data: {
        eventType: base.eventType,
        timestamp: base.timestamp.toString()
      }
    }
  }

  // HTTP methods
  private async sendWebhook(url: string, payload: any, headers: Record<string, string>): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
    }
  }

  private async sendAPIRequest(url: string, payload: any, headers: Record<string, string>, eventType: string): Promise<void> {
    const method = this.getMethodForEventType(eventType)
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(payload) : undefined
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
  }

  // Convenience methods for common integrations
  async syncToAnalytics(calculationData: any): Promise<void> {
    await this.sendToIntegration('analytics', 'calculation_completed', calculationData)
  }

  async syncToCRM(clientData: any): Promise<void> {
    await this.sendToIntegration('crm', 'client_updated', clientData)
  }

  async syncToEHR(healthData: any): Promise<void> {
    await this.sendToIntegration('ehr', 'observation_created', healthData)
  }

  async sendNotification(notificationData: any): Promise<void> {
    await this.sendToIntegration('notifications', 'notification_send', notificationData)
  }

  // Configuration management
  updateIntegration(id: string, config: Partial<IntegrationConfig>): void {
    const existing = this.integrations.get(id)
    if (existing) {
      this.integrations.set(id, { ...existing, ...config })
    }
  }

  enableIntegration(id: string): void {
    this.updateIntegration(id, { enabled: true })
  }

  disableIntegration(id: string): void {
    this.updateIntegration(id, { enabled: false })
  }

  // Monitoring
  getIntegrationStatus(): Record<string, any> {
    const status: Record<string, any> = {}
    
    this.integrations.forEach((integration, id) => {
      const events = this.eventQueue.filter(e => e.integrationId === id)
      status[id] = {
        enabled: integration.enabled,
        pendingEvents: events.filter(e => e.status === 'pending').length,
        failedEvents: events.filter(e => e.status === 'failed').length,
        lastActivity: events.length > 0 ? Math.max(...events.map(e => e.timestamp)) : null
      }
    })
    
    return status
  }

  // Utility methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getAgeGroup(age: number): string {
    if (age < 25) return '18-24'
    if (age < 35) return '25-34'
    if (age < 45) return '35-44'
    if (age < 55) return '45-54'
    return '55+'
  }

  private getMethodForEventType(eventType: string): string {
    const methodMap: Record<string, string> = {
      'create': 'POST',
      'update': 'PUT',
      'delete': 'DELETE',
      'read': 'GET'
    }
    
    return methodMap[eventType.split('_')[0]] || 'POST'
  }
}