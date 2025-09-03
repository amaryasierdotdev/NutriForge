import { Logger } from './Logger'

export interface TestCase {
  name: string
  fn: () => void | Promise<void>
  timeout?: number
}

export class TestRunner {
  private static tests: TestCase[] = []
  private static results: Array<{ name: string; passed: boolean; error?: Error; duration: number }> = []

  static addTest(test: TestCase) {
    this.tests.push(test)
  }

  static async runAll(): Promise<void> {
    Logger.info(`Running ${this.tests.length} tests...`)
    
    for (const test of this.tests) {
      const start = performance.now()
      try {
        await Promise.race([
          Promise.resolve(test.fn()),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), test.timeout || 5000)
          )
        ])
        
        const duration = performance.now() - start
        this.results.push({ name: test.name, passed: true, duration })
        Logger.info(`✓ ${test.name} (${duration.toFixed(2)}ms)`)
      } catch (error) {
        const duration = performance.now() - start
        this.results.push({ name: test.name, passed: false, error: error as Error, duration })
        Logger.error(`✗ ${test.name} (${duration.toFixed(2)}ms)`, error)
      }
    }

    this.printSummary()
  }

  private static printSummary() {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.length - passed
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0)

    Logger.info(`\nTest Summary: ${passed} passed, ${failed} failed (${totalTime.toFixed(2)}ms total)`)
  }

  static getResults() {
    return this.results
  }
}