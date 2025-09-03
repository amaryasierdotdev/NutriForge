export class Analytics {
  private static events: Array<{ name: string; data: any; timestamp: number }> = []

  static track(eventName: string, data?: any) {
    this.events.push({
      name: eventName,
      data,
      timestamp: Date.now()
    })
    
    // Analytics tracking in development mode
  }

  static getEvents() {
    return this.events
  }

  static clearEvents() {
    this.events = []
  }
}