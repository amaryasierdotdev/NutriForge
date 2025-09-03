import { Logger } from './Logger'

export class ErrorHandler {
  static handle(error: Error, context?: string) {
    Logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Error tracing in development mode
  }

  static async handleAsync<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      this.handle(error as Error, context)
      return null
    }
  }

  static handleSync<T>(
    operation: () => T,
    context?: string
  ): T | null {
    try {
      return operation()
    } catch (error) {
      this.handle(error as Error, context)
      return null
    }
  }
}