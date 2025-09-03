import { ErrorHandler } from './ErrorHandler'

export class ApiService {
  private static baseURL = process.env.REACT_APP_API_URL || ''
  private static timeout = 10000

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      ErrorHandler.handle(error as Error, 'ApiService')
      return null
    }
  }

  static async get<T>(endpoint: string): Promise<T | null> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  static async post<T>(endpoint: string, data: any): Promise<T | null> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}