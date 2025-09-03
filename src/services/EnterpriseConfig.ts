export interface EnterpriseConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    buildDate: string
  }
  features: {
    enableAdvancedMode: boolean
    enableExports: boolean
    enableAnalytics: boolean
    enablePerformanceMonitoring: boolean
    enableErrorReporting: boolean
  }
  limits: {
    maxCalculationsPerSession: number
    maxExportsPerDay: number
    sessionTimeoutMinutes: number
  }
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
  }
  ui: {
    defaultTheme: 'light' | 'dark'
    defaultLanguage: string
    defaultUnits: 'metric' | 'imperial'
    animationDuration: number
  }
  performance: {
    enableWebVitals: boolean
    enableResourceMonitoring: boolean
    enableLongTaskDetection: boolean
    performanceThresholds: {
      fcp: number
      lcp: number
      cls: number
      fid: number
      ttfb: number
    }
  }
  security: {
    enableCSP: boolean
    enableHSTS: boolean
    sanitizeInputs: boolean
    maxInputLength: number
  }
}

export class EnterpriseConfigService {
  private static instance: EnterpriseConfigService
  private config: EnterpriseConfig

  private constructor() {
    this.config = this.loadConfig()
  }

  static getInstance(): EnterpriseConfigService {
    if (!EnterpriseConfigService.instance) {
      EnterpriseConfigService.instance = new EnterpriseConfigService()
    }
    return EnterpriseConfigService.instance
  }

  private loadConfig(): EnterpriseConfig {
    const defaultConfig: EnterpriseConfig = {
      app: {
        name: 'Body Recomposition Calculator',
        version: '0.1.0-pre',
        environment: (process.env.NODE_ENV as any) || 'development',
        buildDate: new Date().toISOString()
      },
      features: {
        enableAdvancedMode: true,
        enableExports: true,
        enableAnalytics: process.env.NODE_ENV === 'production',
        enablePerformanceMonitoring: true,
        enableErrorReporting: process.env.NODE_ENV === 'production'
      },
      limits: {
        maxCalculationsPerSession: 100,
        maxExportsPerDay: 50,
        sessionTimeoutMinutes: 60
      },
      api: {
        baseUrl: process.env.REACT_APP_API_URL || '',
        timeout: 30000,
        retryAttempts: 3
      },
      ui: {
        defaultTheme: 'dark',
        defaultLanguage: 'en',
        defaultUnits: 'metric',
        animationDuration: 300
      },
      performance: {
        enableWebVitals: true,
        enableResourceMonitoring: true,
        enableLongTaskDetection: true,
        performanceThresholds: {
          fcp: 1800,
          lcp: 2500,
          cls: 0.1,
          fid: 100,
          ttfb: 800
        }
      },
      security: {
        enableCSP: process.env.NODE_ENV === 'production',
        enableHSTS: process.env.NODE_ENV === 'production',
        sanitizeInputs: true,
        maxInputLength: 1000
      }
    }

    // Override with environment variables if available
    return this.mergeWithEnvVars(defaultConfig)
  }

  private mergeWithEnvVars(config: EnterpriseConfig): EnterpriseConfig {
    // Override specific values from environment variables
    if (process.env.REACT_APP_ENABLE_ANALYTICS === 'true') {
      config.features.enableAnalytics = true
    }
    
    if (process.env.REACT_APP_DEFAULT_THEME) {
      config.ui.defaultTheme = process.env.REACT_APP_DEFAULT_THEME as 'light' | 'dark'
    }
    
    if (process.env.REACT_APP_DEFAULT_LANGUAGE) {
      config.ui.defaultLanguage = process.env.REACT_APP_DEFAULT_LANGUAGE
    }

    return config
  }

  getConfig(): EnterpriseConfig {
    return { ...this.config }
  }

  get<K extends keyof EnterpriseConfig>(section: K): EnterpriseConfig[K] {
    return this.config[section]
  }

  isFeatureEnabled(feature: keyof EnterpriseConfig['features']): boolean {
    return this.config.features[feature]
  }

  getPerformanceThreshold(metric: keyof EnterpriseConfig['performance']['performanceThresholds']): number {
    return this.config.performance.performanceThresholds[metric]
  }

  updateConfig(updates: Partial<EnterpriseConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // Runtime feature flags
  canExport(): boolean {
    return this.isFeatureEnabled('enableExports')
  }

  canUseAdvancedMode(): boolean {
    return this.isFeatureEnabled('enableAdvancedMode')
  }

  shouldTrackAnalytics(): boolean {
    return this.isFeatureEnabled('enableAnalytics')
  }

  shouldMonitorPerformance(): boolean {
    return this.isFeatureEnabled('enablePerformanceMonitoring')
  }

  // Validation helpers
  isValidInputLength(input: string): boolean {
    return input.length <= this.config.security.maxInputLength
  }

  shouldSanitizeInput(): boolean {
    return this.config.security.sanitizeInputs
  }

  // Environment helpers
  isDevelopment(): boolean {
    return this.config.app.environment === 'development'
  }

  isProduction(): boolean {
    return this.config.app.environment === 'production'
  }

  getAppInfo(): { name: string; version: string; environment: string } {
    return {
      name: this.config.app.name,
      version: this.config.app.version,
      environment: this.config.app.environment
    }
  }
}