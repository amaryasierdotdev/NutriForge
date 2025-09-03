import { useState, useEffect, useCallback } from 'react'
import { EnterpriseConfigService } from '../services/EnterpriseConfig'
import { EnterpriseSecurityService } from '../services/EnterpriseSecurityService'
import { EnterpriseAnalyticsService } from '../services/EnterpriseAnalyticsService'

interface EnterpriseFeatures {
  isAdvancedMode: boolean
  canExport: boolean
  hasAnalytics: boolean
  isSecure: boolean
  performanceMode: 'standard' | 'optimized' | 'enterprise'
  featureFlags: Record<string, boolean>
}

export const useEnterpriseFeatures = () => {
  const [features, setFeatures] = useState<EnterpriseFeatures>({
    isAdvancedMode: false,
    canExport: false,
    hasAnalytics: false,
    isSecure: false,
    performanceMode: 'standard',
    featureFlags: {}
  })

  const config = EnterpriseConfigService.getInstance()
  const security = EnterpriseSecurityService.getInstance()
  const analytics = EnterpriseAnalyticsService.getInstance()

  // Initialize enterprise features
  useEffect(() => {
    const initializeFeatures = async () => {
      try {
        // Initialize security
        security.initializeCSP()
        security.setSecurityHeaders()
        security.detectThreats()

        // Load feature configuration
        const enterpriseConfig = config.getConfig()
        
        setFeatures({
          isAdvancedMode: config.canUseAdvancedMode(),
          canExport: config.canExport(),
          hasAnalytics: config.shouldTrackAnalytics(),
          isSecure: enterpriseConfig.app.environment === 'production',
          performanceMode: enterpriseConfig.app.environment === 'production' ? 'enterprise' : 'standard',
          featureFlags: {
            enableCaching: enterpriseConfig.features.enablePerformanceMonitoring,
            enableAudit: enterpriseConfig.features.enableErrorReporting,
            enableExports: enterpriseConfig.features.enableExports,
            enableAdvanced: enterpriseConfig.features.enableAdvancedMode
          }
        })

        // Track initialization
        analytics.track('app_initialized', 'System', 'startup', {
          customDimensions: {
            environment: enterpriseConfig.app.environment,
            version: enterpriseConfig.app.version,
            features: Object.keys(enterpriseConfig.features).join(',')
          }
        })

      } catch (error) {
        analytics.trackError(error as Error, { context: 'feature_initialization' })
      }
    }

    initializeFeatures()
  }, [analytics, config, security])

  // Toggle advanced mode
  const toggleAdvancedMode = useCallback(() => {
    if (config.canUseAdvancedMode()) {
      setFeatures(prev => ({
        ...prev,
        isAdvancedMode: !prev.isAdvancedMode
      }))
      
      analytics.track('feature_toggle', 'User', 'advanced_mode', {
        label: features.isAdvancedMode ? 'disabled' : 'enabled'
      })
    }
  }, [analytics, config, features.isAdvancedMode])

  // Check feature availability
  const isFeatureEnabled = useCallback((feature: string): boolean => {
    return features.featureFlags[feature] || false
  }, [features.featureFlags])

  // Get performance recommendations
  const getPerformanceRecommendations = useCallback((): string[] => {
    const recommendations: string[] = []
    
    if (features.performanceMode === 'standard') {
      recommendations.push('Enable caching for better performance')
    }
    
    if (!features.hasAnalytics) {
      recommendations.push('Enable analytics for insights')
    }
    
    if (!features.isSecure) {
      recommendations.push('Deploy with HTTPS for security')
    }
    
    return recommendations
  }, [features])

  // Export feature configuration
  const exportFeatureConfig = useCallback((): string => {
    const configData = {
      features,
      config: config.getConfig(),
      analytics: analytics.getAnalyticsSummary(),
      timestamp: new Date().toISOString()
    }
    
    analytics.track('config_export', 'Admin', 'export')
    
    return JSON.stringify(configData, null, 2)
  }, [analytics, config, features])

  // Health check
  const performHealthCheck = useCallback(async () => {
    try {
      const healthData = {
        features: Object.keys(features.featureFlags).length,
        security: features.isSecure,
        performance: features.performanceMode,
        analytics: features.hasAnalytics,
        timestamp: Date.now()
      }
      
      analytics.track('health_check', 'System', 'check', {
        customDimensions: healthData as any
      })
      
      return { status: 'healthy', data: healthData }
    } catch (error) {
      analytics.trackError(error as Error, { context: 'health_check' })
      return { status: 'error', error: (error as Error).message }
    }
  }, [analytics, features])

  return {
    features,
    toggleAdvancedMode,
    isFeatureEnabled,
    getPerformanceRecommendations,
    exportFeatureConfig,
    performHealthCheck,
    
    // Direct service access
    config,
    security,
    analytics
  }
}