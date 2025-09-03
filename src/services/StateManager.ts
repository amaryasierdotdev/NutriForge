type StateListener<T> = (state: T) => void

export class StateManager<T> {
  private state: T
  private listeners: Set<StateListener<T>> = new Set()

  constructor(initialState: T) {
    this.state = initialState
  }

  getState(): T {
    return { ...this.state } as T
  }

  setState(newState: Partial<T>): void {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state))
  }
}