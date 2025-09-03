export class StateDebugger {
  private static isEnabled = process.env.NODE_ENV === 'development'
  private static history: Array<{ timestamp: number; state: any; action: string }> = []

  static log(action: string, state: any): void {
    if (!this.isEnabled) return

    const entry = {
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)),
      action
    }

    this.history.push(entry)
    
    if (this.history.length > 50) {
      this.history.shift()
    }

    // Group logging disabled
    // Logging disabled
    // Logging disabled
    // Group logging disabled
  }

  static getHistory(): Array<{ timestamp: number; state: any; action: string }> {
    return [...this.history]
  }

  static clear(): void {
    this.history = []
  }

  static diff(oldState: any, newState: any): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {}
    
    Object.keys({ ...oldState, ...newState }).forEach(key => {
      if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
        changes[key] = { old: oldState[key], new: newState[key] }
      }
    })

    return changes
  }
}