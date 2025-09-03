interface NotificationConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  duration: number
  maxNotifications: number
  enableSound: boolean
  enablePush: boolean
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary'
  }>
  persistent?: boolean
}

export class EnterpriseNotificationService {
  private static instance: EnterpriseNotificationService
  private notifications: Notification[] = []
  private config: NotificationConfig
  private subscribers: Array<(notifications: Notification[]) => void> = []

  private constructor() {
    this.config = {
      position: 'top-right',
      duration: 5000,
      maxNotifications: 5,
      enableSound: true,
      enablePush: false
    }
    
    this.requestPermissions()
  }

  static getInstance(): EnterpriseNotificationService {
    if (!EnterpriseNotificationService.instance) {
      EnterpriseNotificationService.instance = new EnterpriseNotificationService()
    }
    return EnterpriseNotificationService.instance
  }

  // Request browser permissions
  private async requestPermissions(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // Show notification
  show(
    type: Notification['type'],
    title: string,
    message: string,
    options?: Partial<Notification>
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: Date.now(),
      duration: options?.duration || this.config.duration,
      actions: options?.actions,
      persistent: options?.persistent || false
    }

    // Add to queue
    this.notifications.unshift(notification)

    // Maintain max notifications
    if (this.notifications.length > this.config.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.config.maxNotifications)
    }

    // Auto-dismiss if not persistent
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        this.dismiss(notification.id)
      }, notification.duration)
    }

    // Play sound
    if (this.config.enableSound) {
      this.playNotificationSound(type)
    }

    // Show browser notification
    if (this.config.enablePush) {
      this.showBrowserNotification(notification)
    }

    // Notify subscribers
    this.notifySubscribers()

    return notification.id
  }

  // Convenience methods
  success(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('success', title, message, options)
  }

  error(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('error', title, message, { ...options, persistent: true })
  }

  warning(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('warning', title, message, options)
  }

  info(title: string, message: string, options?: Partial<Notification>): string {
    return this.show('info', title, message, options)
  }

  // System notifications
  systemAlert(message: string): string {
    return this.error('System Alert', message, {
      persistent: true,
      actions: [
        {
          label: 'Acknowledge',
          action: () => this.dismissAll(),
          style: 'primary'
        }
      ]
    })
  }

  calculationComplete(results: any): string {
    return this.success('Calculation Complete', 'Your nutrition plan is ready!', {
      actions: [
        {
          label: 'View Results',
          action: () => this.scrollToResults(),
          style: 'primary'
        }
      ]
    })
  }

  dataExported(format: string): string {
    return this.success('Export Complete', `Data exported as ${format}`, {
      duration: 3000
    })
  }

  // Dismiss notifications
  dismiss(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifySubscribers()
  }

  dismissAll(): void {
    this.notifications = []
    this.notifySubscribers()
  }

  dismissByType(type: Notification['type']): void {
    this.notifications = this.notifications.filter(n => n.type !== type)
    this.notifySubscribers()
  }

  // Subscription management
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback([...this.notifications])
    })
  }

  // Browser notifications
  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.persistent
      })

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
      }

      if (!notification.persistent) {
        setTimeout(() => {
          browserNotification.close()
        }, notification.duration || this.config.duration)
      }
    }
  }

  // Sound notifications
  private playNotificationSound(type: Notification['type']): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for different types
      const frequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500
      }

      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // Fallback for browsers without Web Audio API
      // Logging disabled
    }
  }

  // Utility methods
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private scrollToResults(): void {
    const resultsElement = document.querySelector('.results-grid')
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Configuration
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): NotificationConfig {
    return { ...this.config }
  }

  // Get current notifications
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  // Clear expired notifications
  clearExpired(): void {
    const now = Date.now()
    this.notifications = this.notifications.filter(notification => {
      if (notification.persistent) return true
      if (!notification.duration) return true
      return (now - notification.timestamp) < notification.duration
    })
    this.notifySubscribers()
  }

  // Statistics
  getStats(): {
    total: number
    byType: Record<string, number>
    persistent: number
  } {
    const stats = {
      total: this.notifications.length,
      byType: {} as Record<string, number>,
      persistent: 0
    }

    this.notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
      if (notification.persistent) stats.persistent++
    })

    return stats
  }
}