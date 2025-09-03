interface WorkerTask<T, R> {
  id: string
  data: T
  resolve: (result: R) => void
  reject: (error: Error) => void
}

export class WorkerManager {
  private static workers: Worker[] = []
  private static taskQueue: WorkerTask<any, any>[] = []
  private static maxWorkers = navigator.hardwareConcurrency || 4

  static async executeTask<T, R>(
    workerScript: string,
    data: T
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask<T, R> = {
        id: Math.random().toString(36),
        data,
        resolve,
        reject
      }

      this.taskQueue.push(task)
      this.processQueue(workerScript)
    })
  }

  private static processQueue(workerScript: string): void {
    if (this.taskQueue.length === 0) return

    const availableWorker = this.getAvailableWorker(workerScript)
    if (!availableWorker) return

    const task = this.taskQueue.shift()!
    this.runTask(availableWorker, task)
  }

  private static getAvailableWorker(workerScript: string): Worker | null {
    if (this.workers.length < this.maxWorkers) {
      const worker = new Worker(workerScript)
      this.workers.push(worker)
      return worker
    }
    return this.workers[0] // Simple round-robin
  }

  private static runTask<T, R>(worker: Worker, task: WorkerTask<T, R>): void {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.id === task.id) {
        worker.removeEventListener('message', handleMessage)
        worker.removeEventListener('error', handleError)
        
        if (e.data.error) {
          task.reject(new Error(e.data.error))
        } else {
          task.resolve(e.data.result)
        }
        
        this.processQueue(worker.constructor.name)
      }
    }

    const handleError = (error: ErrorEvent) => {
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleError)
      task.reject(new Error(error.message))
    }

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', handleError)
    worker.postMessage({ id: task.id, data: task.data })
  }

  static terminate(): void {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.taskQueue = []
  }
}