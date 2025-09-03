interface BatchTask<T, R> {
  id: string
  data: T
  resolve: (result: R) => void
  reject: (error: Error) => void
}

export class BatchProcessor<T, R> {
  private queue: BatchTask<T, R>[] = []
  private processing = false
  private batchSize: number
  private delay: number

  constructor(batchSize = 10, delay = 100) {
    this.batchSize = batchSize
    this.delay = delay
  }

  async add(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id: Math.random().toString(36),
        data,
        resolve,
        reject
      })

      if (!this.processing) {
        this.process()
      }
    })
  }

  private async process(): Promise<void> {
    this.processing = true

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize)
      
      try {
        const results = await this.processBatch(batch.map(task => task.data))
        
        batch.forEach((task, index) => {
          task.resolve(results[index])
        })
      } catch (error) {
        batch.forEach(task => {
          task.reject(error as Error)
        })
      }

      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay))
      }
    }

    this.processing = false
  }

  protected async processBatch(items: T[]): Promise<R[]> {
    // Override this method in subclasses
    return items as unknown as R[]
  }
}