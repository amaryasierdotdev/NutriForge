type EventHandler<T = any> = (data: T) => void

export class EventBus {
  private static events: Map<string, Set<EventHandler>> = new Map()

  static on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
    
    return () => this.off(event, handler)
  }

  static off<T>(event: string, handler: EventHandler<T>): void {
    this.events.get(event)?.delete(handler)
  }

  static emit<T>(event: string, data?: T): void {
    this.events.get(event)?.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        // Handle event handler error silently
      }
    })
  }

  static clear(): void {
    this.events.clear()
  }
}