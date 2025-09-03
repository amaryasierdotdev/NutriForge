export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static level: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG

  static error(message: string, data?: any) {
    if (this.level >= LogLevel.ERROR) {
      // Error logging disabled
    }
  }

  static warn(message: string, data?: any) {
    if (this.level >= LogLevel.WARN) {
      // Warning logging disabled
    }
  }

  static info(message: string, data?: any) {
    if (this.level >= LogLevel.INFO) {
      // Info logging disabled
    }
  }

  static debug(message: string, data?: any) {
    if (this.level >= LogLevel.DEBUG) {
      // Debug logging disabled
    }
  }
}