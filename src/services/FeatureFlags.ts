interface FeatureConfig {
  [key: string]: boolean | string | number
}

export class FeatureFlags {
  private static flags: FeatureConfig = {
    advancedMode: true,
    exportFormats: true,
    keyboardShortcuts: true,
    analytics: process.env.NODE_ENV === 'production',
    performanceMonitoring: true,
    errorReporting: true
  }

  static isEnabled(flag: string): boolean {
    return Boolean(this.flags[flag])
  }

  static getValue<T>(flag: string, defaultValue: T): T {
    return (this.flags[flag] as T) ?? defaultValue
  }

  static setFlag(flag: string, value: boolean | string | number): void {
    this.flags[flag] = value
  }

  static getAllFlags(): FeatureConfig {
    return { ...this.flags }
  }

  static loadFromRemote(): Promise<void> {
    // In production, this would fetch from a remote config service
    return Promise.resolve()
  }
}