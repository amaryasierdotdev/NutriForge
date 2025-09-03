export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  component?: string
  action?: string
}

export class EnterpriseLogger {
  private static instance: EnterpriseLogger
  private logLevel: LogLevel = LogLevel.INFO
  private sessionId: string
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private constructor() {
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): EnterpriseLogger {
    if (!EnterpriseLogger.instance) {
      EnterpriseLogger.instance = new EnterpriseLogger()
    }
    return EnterpriseLogger.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    component?: string,
    action?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      component,
      action
    }
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output disabled
  }

  debug(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.addLog(this.createLogEntry(LogLevel.DEBUG, message, context, component, action))
    }
  }

  info(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.addLog(this.createLogEntry(LogLevel.INFO, message, context, component, action))
    }
  }

  warn(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.addLog(this.createLogEntry(LogLevel.WARN, message, context, component, action))
    }
  }

  error(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.addLog(this.createLogEntry(LogLevel.ERROR, message, context, component, action))
    }
  }

  fatal(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      this.addLog(this.createLogEntry(LogLevel.FATAL, message, context, component, action))
    }
  }

  // Enterprise features
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level)
    }
    return [...this.logs]
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  clearLogs(): void {
    this.logs = []
  }

  getSessionId(): string {
    return this.sessionId
  }

  // Performance logging
  startTimer(operation: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.info(`Operation completed: ${operation}`, {
        operation,
        duration: `${duration.toFixed(2)}ms`
      }, 'Performance', 'Timer')
    }
  }

  // User action tracking
  trackUserAction(action: string, component: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      ...context,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }, component, action)
  }

  // Error boundary integration
  logError(error: Error, errorInfo?: Record<string, any>): void {
    this.error(`Unhandled error: ${error.message}`, {
      stack: error.stack,
      name: error.name,
      ...errorInfo
    }, 'ErrorBoundary', 'UnhandledError')
  }
}