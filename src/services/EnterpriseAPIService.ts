interface APIConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  apiKey?: string
}

interface APIResponse<T = any> {
  data: T
  status: number
  message: string
  timestamp: string
}

export class EnterpriseAPIService {
  private static instance: EnterpriseAPIService
  private config: APIConfig
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessing = false

  private constructor() {
    this.config = {
      baseURL: process.env.REACT_APP_API_URL || 'https://api.nutriforge.com',
      timeout: 30000,
      retryAttempts: 3,
      apiKey: process.env.REACT_APP_API_KEY
    }
  }

  static getInstance(): EnterpriseAPIService {
    if (!EnterpriseAPIService.instance) {
      EnterpriseAPIService.instance = new EnterpriseAPIService()
    }
    return EnterpriseAPIService.instance
  }

  // Generic API request with retry logic
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-API-Version': '1.0',
      'X-Client': 'NutriForge-Pro',
      ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      signal: AbortSignal.timeout(this.config.timeout)
    }

    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        data,
        status: response.status,
        message: 'Success',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
        return this.makeRequest<T>(endpoint, options, attempt + 1)
      }
      
      throw error
    }
  }

  // Queue management for rate limiting
  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return
    
    this.isProcessing = true
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (request) {
        await request()
        await this.delay(100) // Rate limiting
      }
    }
    
    this.isProcessing = false
  }

  // Nutrition data endpoints
  async getNutritionData(metrics: any): Promise<APIResponse> {
    return this.queueRequest(() =>
      this.makeRequest('/nutrition/calculate', {
        method: 'POST',
        body: JSON.stringify(metrics)
      })
    )
  }

  async getFoodDatabase(query: string): Promise<APIResponse> {
    return this.queueRequest(() =>
      this.makeRequest(`/foods/search?q=${encodeURIComponent(query)}`)
    )
  }

  async getSupplementRecommendations(profile: any): Promise<APIResponse> {
    return this.queueRequest(() =>
      this.makeRequest('/supplements/recommend', {
        method: 'POST',
        body: JSON.stringify(profile)
      })
    )
  }

  // User profile endpoints
  async saveUserProfile(profile: any): Promise<APIResponse> {
    return this.queueRequest(() =>
      this.makeRequest('/users/profile', {
        method: 'POST',
        body: JSON.stringify(profile)
      })
    )
  }

  async getUserHistory(userId: string): Promise<APIResponse> {
    return this.queueRequest(() =>
      this.makeRequest(`/users/${userId}/history`)
    )
  }

  // Analytics endpoints
  async sendAnalytics(events: any[]): Promise<APIResponse> {
    return this.queueRequest(() =>
      this.makeRequest('/analytics/events', {
        method: 'POST',
        body: JSON.stringify({ events })
      })
    )
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    return this.makeRequest('/health')
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Configuration
  updateConfig(newConfig: Partial<APIConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): APIConfig {
    return { ...this.config }
  }

  // Request interceptors
  onRequest(callback: (config: RequestInit) => RequestInit): void {
    // Implementation for request interceptors
  }

  onResponse(callback: (response: Response) => Response): void {
    // Implementation for response interceptors
  }

  onError(callback: (error: Error) => void): void {
    // Implementation for error interceptors
  }
}