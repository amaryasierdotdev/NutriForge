interface RetryConfig {
  maxAttempts: number
  delay: number
  backoffMultiplier?: number
  maxDelay?: number
}

export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    const { maxAttempts, delay, backoffMultiplier = 2, maxDelay = 30000 } = config
    let lastError: Error
    let currentDelay = delay

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxAttempts) {
          throw lastError
        }

        await this.sleep(Math.min(currentDelay, maxDelay))
        currentDelay *= backoffMultiplier
      }
    }

    throw lastError!
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}