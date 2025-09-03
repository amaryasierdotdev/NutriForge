import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useEnterpriseCalculator } from './hooks/useEnterpriseCalculator'
import { ValidationService } from './services/ValidationService'
import { GlobalStyles } from './styles/GlobalStyles'
import { Input } from './components/ui/Input'
import { Button } from './components/ui/Button'
import { MetricDisplay } from './components/ui/MetricDisplay'
import { Tabs } from './components/ui/Tabs'
import { Tooltip } from './components/ui/Tooltip'
import { NotificationToast } from './components/ui/NotificationToast'
import { ScrollToTop } from './components/ui/ScrollToTop'
import { GradientText } from './components/ui/GradientText'
import { CircularProgress } from './components/ui/DataVisualization'
import { InteractiveCard } from './components/ui/InteractiveCard'
import { EnhancedMetricDisplay } from './components/ui/EnhancedMetricDisplay'
import { CaffeineBreakdown } from './components/ui/CaffeineBreakdown'
import { UserMetrics } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useInputMode } from './hooks/useInputMode'
import { useTranslation } from './hooks/useTranslation'
import { EXPORT_FORMATS, CAFFEINE_INTAKE } from './services/Constants'
import { UnitConversionService } from './services/UnitConversionService'
import { NutritionCalculatorService } from './services/NutritionCalculatorService'
import { EnterpriseLogger } from './services/EnterpriseLogger'
import { EnterprisePerformanceMonitor } from './services/EnterprisePerformanceMonitor'
import { EnterpriseConfigService } from './services/EnterpriseConfig'
import { InputSanitizationService } from './services/InputSanitizationService'
import { EnterpriseCacheService } from './services/EnterpriseCacheService'
import { EnterpriseAuditService } from './services/EnterpriseAuditService'
import { EnterpriseDebugPanel } from './components/ui/EnterpriseDebugPanel'

import { useEnterpriseFeatures } from './hooks/useEnterpriseFeatures'
import { EnterpriseStatusBar } from './components/ui/EnterpriseStatusBar'
import { EnterpriseCommandCenter } from './components/ui/EnterpriseCommandCenter'
import { ErrorBoundary } from './components/ErrorBoundary'

const AppContainer = styled.div<{ isDarkMode: boolean }>`
  min-height: 100vh;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #000000 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #f8fafc 100%)'};
  color: ${props => (props.isDarkMode ? '#ffffff' : '#0f172a')};
  position: relative;
  overflow-x: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props =>
      props.isDarkMode
        ? 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
        : 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.02) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 60%)'};
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 1600px) {
    .results-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .nutrition-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const Header = styled.header<{ isDarkMode: boolean }>`
  text-align: center;
  padding: 40px 24px 32px;
  position: relative;
  border-bottom: 1px solid
    ${props =>
      props.isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(9, 9, 11, 0.8) 0%, rgba(15, 15, 15, 0.9) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  backdrop-filter: blur(24px);
  box-shadow: ${props =>
    props.isDarkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(16, 185, 129, 0.6) 25%,
      rgba(59, 130, 246, 0.6) 50%,
      rgba(139, 92, 246, 0.6) 75%,
      transparent 100%
    );
  }

  @media (max-width: 768px) {
    padding: 32px 20px 24px;
  }
`

const HeaderContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
`

const MainTitle = styled.h1<{ isDarkMode: boolean }>`
  font-size: clamp(2rem, 4.5vw, 2.8rem);
  font-weight: 300;
  margin-bottom: 16px;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #10b981 30%,
    #3b82f6 70%,
    #8b5cf6 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  letter-spacing: -0.02em;
  position: relative;
  filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));

  &::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(16, 185, 129, 0.6),
      rgba(59, 130, 246, 0.4),
      transparent
    );
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 1px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 1px;
  }
`

const Subtitle = styled.p<{ isDarkMode: boolean }>`
  font-size: 12px;
  color: ${props => (props.isDarkMode ? '#6b7280' : '#64748b')};
  margin: 8px 0 0 0;
  font-weight: 300;
  opacity: 0.9;
  lineHeight: 1.4;
  letterSpacing: 0.01em;
`

const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px 120px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(16, 185, 129, 0.1) 20%,
      rgba(59, 130, 246, 0.1) 50%,
      rgba(139, 92, 246, 0.1) 80%,
      transparent 100%
    );
    pointer-events: none;
    opacity: 0.3;
  }

  @media (max-width: 1200px) {
    max-width: 100%;
    padding: 0 24px 100px;
  }

  @media (max-width: 768px) {
    padding: 0 20px 80px;
  }
`

const FormCard = styled.div<{ isDarkMode: boolean }>`
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border: 1px solid
    ${props =>
      props.isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${props =>
    props.isDarkMode
      ? '0 32px 64px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 20px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(32px);
  border-radius: 24px;
  position: relative;
  overflow: visible;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: ${props =>
      props.isDarkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'};
    box-shadow: ${props =>
      props.isDarkMode
        ? '0 40px 80px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        : '0 32px 64px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(16, 185, 129, 0.6) 25%,
      rgba(59, 130, 246, 0.6) 50%,
      rgba(139, 92, 246, 0.6) 75%,
      transparent 100%
    );
    opacity: 0.8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
  }
`

const StatValue = styled.div`
  font-size: clamp(2rem, 4.5vw, 2.8rem);
  font-weight: 300;
  color: #ffffff;
  margin-bottom: 16px;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #10b981 30%,
    #3b82f6 70%,
    #8b5cf6 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  letter-spacing: -0.02em;
  position: relative;
  filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));

  &::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(16, 185, 129, 0.6),
      rgba(59, 130, 246, 0.4),
      transparent
    );
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 1px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 1px;
  }
`

const ResultCard = styled.div<{ isDarkMode: boolean }>`
  background: ${props =>
    props.isDarkMode ? 'rgba(9, 9, 11, 0.8)' : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid
    ${props =>
      props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.15)'};
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(24px);
  padding: 32px;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: ${props =>
      props.isDarkMode
        ? '0 20px 40px -12px rgba(16, 185, 129, 0.1)'
        : '0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      #10b981,
      #3b82f6,
      transparent
    );
  }
`

const App: React.FC = () => {
  const { results, loading, error, calculate, reset } =
    useEnterpriseCalculator()
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    weight: '',
    height: '',
    age: '',
    activityLevel: '',
    bodyFatPercentage: '',
  })
  const [validation, setValidation] = useState<any>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
  }>({ message: '', type: 'info', isVisible: false })
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', true)
  const [showCommandCenter, setShowCommandCenter] = useState(false)
  const { toggleMode } = useInputMode()
  const [useSliders, setUseSliders] = useLocalStorage('useSliders', true)
  const [useMetric, setUseMetric] = useLocalStorage('useMetric', true)
  const { t } = useTranslation()
  const logger = EnterpriseLogger.getInstance()
  const performanceMonitor = EnterprisePerformanceMonitor.getInstance()
  const config = EnterpriseConfigService.getInstance()
  const sanitizer = InputSanitizationService.getInstance()
  const cache = EnterpriseCacheService.getInstance()
  const audit = EnterpriseAuditService.getInstance()
  const { analytics } = useEnterpriseFeatures()
  const nutritionService = useMemo(() => new NutritionCalculatorService(), [])

  useKeyboardShortcuts([
    { key: 'd', ctrlKey: true, callback: () => setIsDarkMode(!isDarkMode) },
    { key: 'r', ctrlKey: true, callback: () => reset() },
    { key: 'Enter', ctrlKey: true, callback: () => handleSubmit(new Event('submit') as any) },
    { key: 'i', ctrlKey: true, callback: () => toggleMode() }
  ])

  useEffect(() => {
    document.body.className = isDarkMode ? '' : 'light-mode'
    import('./services/ThemeManager').then(({ ThemeManager }) => {
      ThemeManager.applyTheme(isDarkMode)
    })
  }, [isDarkMode])

  // Initialize performance monitoring
  useEffect(() => {
    logger.info('Application initialized', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      darkMode: isDarkMode,
      metric: useMetric
    })

    // Report Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        performanceMonitor.recordWebVital({
          name: 'CLS',
          value: metric.value,
          rating: metric.rating as any,
          timestamp: Date.now()
        })

        if (metric.value > config.getPerformanceThreshold('cls')) {
          audit.logPerformanceIssue('CLS', metric.value, config.getPerformanceThreshold('cls'))
        }
      })

      getFID((metric) => {
        performanceMonitor.recordWebVital({
          name: 'FID',
          value: metric.value,
          rating: metric.rating as any,
          timestamp: Date.now()
        })

        if (metric.value > config.getPerformanceThreshold('fid')) {
          audit.logPerformanceIssue('FID', metric.value, config.getPerformanceThreshold('fid'))
        }
      })

      getFCP((metric) => {
        performanceMonitor.recordWebVital({
          name: 'FCP',
          value: metric.value,
          rating: metric.rating as any,
          timestamp: Date.now()
        })

        if (metric.value > config.getPerformanceThreshold('fcp')) {
          audit.logPerformanceIssue('FCP', metric.value, config.getPerformanceThreshold('fcp'))
        }
      })

      getLCP((metric) => {
        performanceMonitor.recordWebVital({
          name: 'LCP',
          value: metric.value,
          rating: metric.rating as any,
          timestamp: Date.now()
        })

        if (metric.value > config.getPerformanceThreshold('lcp')) {
          audit.logPerformanceIssue('LCP', metric.value, config.getPerformanceThreshold('lcp'))
        }
      })

      getTTFB((metric) => {
        performanceMonitor.recordWebVital({
          name: 'TTFB',
          value: metric.value,
          rating: metric.rating as any,
          timestamp: Date.now()
        })

        if (metric.value > config.getPerformanceThreshold('ttfb')) {
          audit.logPerformanceIssue('TTFB', metric.value, config.getPerformanceThreshold('ttfb'))
        }
      })
    }).catch(() => {
      logger.debug('Web Vitals not available')
    })

    // Cleanup interval for rate limiting
    const cleanupInterval = setInterval(() => {
      sanitizer.cleanupRateLimits()
    }, 300000) // Clean up every 5 minutes

    return () => {
      logger.info('Application unmounting')
      clearInterval(cleanupInterval)
    }
  }, [audit, config, isDarkMode, logger, performanceMonitor, sanitizer, useMetric])

  const validationService = new ValidationService()

  const handleInputChange = (field: string, value: string | number) => {
    const stringValue = String(value)

    // Rate limiting check
    if (!sanitizer.checkRateLimit('form_input', 50, 60000)) {
      logger.warn('Rate limit exceeded for form input')
      return
    }

    logger.trackUserAction('input_change', 'Form', { field, value: stringValue })
    audit.logUserAction('form_input_change', { field, hasValue: !!stringValue })
    analytics.track('form_input', 'User', 'change', { label: field })

    // Sanitize input based on field type
    let sanitizedValue = stringValue
    if (field === 'name') {
      sanitizedValue = sanitizer.sanitizeClientName(stringValue)
    } else if (['weight', 'height', 'age', 'bodyFatPercentage'].includes(field)) {
      const numValue = sanitizer.sanitizeNumber(stringValue)
      sanitizedValue = numValue !== null ? String(numValue) : ''
    } else {
      sanitizedValue = sanitizer.sanitizeText(stringValue)
    }

    setFormData(prev => {
      const newData = { ...prev, [field]: sanitizedValue }

      // Handle gender change and body fat percentage validation
      if (field === 'gender') {
        const currentBF = Number(prev.bodyFatPercentage)
        const maleMax = 20, femaleMax = 28, maleMin = 10, femaleMin = 18

        if (stringValue === 'male') {
          if (!prev.bodyFatPercentage || currentBF > maleMax || currentBF < maleMin) {
            newData.bodyFatPercentage = '15'
            logger.info('Auto-adjusted body fat percentage for male', { from: currentBF, to: 15 })
          }
        } else if (stringValue === 'female') {
          if (!prev.bodyFatPercentage || currentBF > femaleMax || currentBF < femaleMin) {
            newData.bodyFatPercentage = '23'
            logger.info('Auto-adjusted body fat percentage for female', { from: currentBF, to: 23 })
          }
        }
      }

      return newData
    })

    if (validation) setValidation(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Rate limiting for form submissions
    if (!sanitizer.checkRateLimit('form_submit', config.get('limits').maxCalculationsPerSession, 3600000)) {
      setNotification({
        message: t('messages.rateLimitExceeded'),
        type: 'error',
        isVisible: true,
      })
      return
    }

    // Sanitize all form data before processing
    const sanitizedFormData = sanitizer.sanitizeFormData(formData)

    logger.trackUserAction('form_submit', 'CalculationForm', { useMetric, formData: sanitizedFormData })
    audit.logUserAction('calculation_requested', { useMetric, hasFormData: !!sanitizedFormData })
    analytics.trackCalculation('nutrition_calculation', sanitizedFormData)
    const endTimer = logger.startTimer('nutrition_calculation')
    const perfTimer = performanceMonitor.startTimer('form_submission')

    const [{ PerformanceMonitor }, { Analytics }, { MetricsCollector }] = await Promise.all([
      import('./services/PerformanceMonitor'),
      import('./services/Analytics'),
      import('./services/MetricsCollector')
    ])

    const legacyPerfTimer = PerformanceMonitor.startTimer('calculation')
    MetricsCollector.increment('form_submission')

    const metrics: UserMetrics = {
      gender: sanitizedFormData.gender as 'male' | 'female',
      weight: UnitConversionService.convertWeightToMetric(Number(sanitizedFormData.weight), useMetric),
      height: UnitConversionService.convertHeightToMetric(Number(sanitizedFormData.height), useMetric),
      age: Number(sanitizedFormData.age),
      activityLevel: sanitizedFormData.activityLevel as any,
      bodyFatPercentage: Number(sanitizedFormData.bodyFatPercentage),
    }

    // Create raw metrics for validation (before conversion)
    const rawMetrics: UserMetrics = {
      gender: sanitizedFormData.gender as 'male' | 'female',
      weight: Number(sanitizedFormData.weight),
      height: Number(sanitizedFormData.height),
      age: Number(sanitizedFormData.age),
      activityLevel: sanitizedFormData.activityLevel as any,
      bodyFatPercentage: Number(sanitizedFormData.bodyFatPercentage),
    }

    const validationResult = validationService.validateUserMetrics(rawMetrics, useMetric)
    setValidation(validationResult)

    if (validationResult.isValid) {
      logger.info('Validation passed, starting calculation', { metrics })
      Analytics.track('calculation_started', metrics)
      MetricsCollector.increment('calculation_started')
      setNotification({
        message: t('messages.analyzing'),
        type: 'info',
        isVisible: true,
      })

      try {
        // Check cache first
        const cachedResults = cache.getCachedCalculation(metrics)

        if (cachedResults) {
          audit.logDataAccess('cached_calculation', { cacheHit: true })
          // Simulate async operation for consistency
          await new Promise(resolve => setTimeout(resolve, 100))
          // Set results directly from cache
          // Note: This would need to be integrated with the calculator hook
        } else {
          await calculate(metrics)
          // Cache the results after calculation
          if (results) {
            cache.cacheCalculation(metrics, results)
            audit.logCalculation(metrics, results)
          }
        }

        endTimer()
        perfTimer()
        legacyPerfTimer()
        logger.info('Calculation completed successfully')
        Analytics.track('calculation_completed')
        analytics.trackEngagement('calculation_completed')
        setNotification({
          message: t('messages.completed'),
          type: 'success',
          isVisible: true,
        })
      } catch (error) {
        endTimer()
        perfTimer()
        legacyPerfTimer()
        const errorMessage = (error as Error).message
        logger.error('Calculation failed', { error: errorMessage, metrics })
        audit.logError(error as Error, { metrics, phase: 'calculation' })
        analytics.trackError(error as Error, { metrics, phase: 'calculation' })
        MetricsCollector.increment('calculation_error')
        Analytics.track('calculation_failed', { error: errorMessage })
        setNotification({
          message: t('messages.failed'),
          type: 'error',
          isVisible: true,
        })
      }
    } else {
      endTimer()
      perfTimer()
      legacyPerfTimer()
      logger.warn('Validation failed', { errors: validationResult.errors, warnings: validationResult.warnings })
      MetricsCollector.increment('validation_error')
      Analytics.track('validation_failed', validationResult.errors)
      setNotification({
        message: t('messages.validationError'),
        type: 'error',
        isVisible: true,
      })
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return t('categories.underweight')
    if (bmi < 25) return t('categories.normalWeight')
    if (bmi < 30) return t('categories.overweight')
    return t('categories.obese')
  }

  const getFiber = (carbs: number) =>
    Math.min(25 + Math.floor(carbs / 50) * 5, 75)

  const getHydration = () => {
    if (!formData.weight || !results)
      return { maintenance: 0, training: 0, pre: 0, intra: 0.4, post: 1.25 }
    const baseline = results.bodyComposition.tdee / 1000
    const preWorkout = (Number(formData.weight) * 5) / 1000
    const intraWorkout = 0.4
    const postWorkout = 1.25
    return {
      maintenance: baseline,
      training: baseline + preWorkout + intraWorkout + postWorkout,
      pre: preWorkout,
      intra: intraWorkout,
      post: postWorkout,
    }
  }

  const hydration = getHydration()

  const nutritionTabs = useMemo(
    () =>
      results
        ? [
            {
              id: 'bulk',
              label: t('nutrition.bulk'),
              content: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                  }}
                >
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <EnhancedMetricDisplay
                      label={t('nutrition.lean')}
                      value={Math.round(results.bodyComposition.tdee * 1.05)}
                      unit="kcal"
                      variant="highlighted"
                      trend="up"
                      isDarkMode={isDarkMode}
                    />
                    <EnhancedMetricDisplay
                      label={t('nutrition.aggressive')}
                      value={Math.round(results.bodyComposition.tdee * 1.15)}
                      unit="kcal"
                      variant="highlighted"
                      trend="up"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <EnhancedMetricDisplay
                    label={t('nutrition.protein')}
                    value={results.nutrition.bulk.protein}
                    unit="g"
                    variant="highlighted"
                    isDarkMode={isDarkMode}
                  />
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <MetricDisplay
                      label={`${t('nutrition.fat')} (${t('nutrition.lean').split(' ')[0]})`}
                      value={Math.round(
                        nutritionService.calculateFat(
                          results.bodyComposition.tdee * 1.05,
                          Number(formData.bodyFatPercentage),
                          formData.gender as 'male' | 'female'
                        )
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                    <MetricDisplay
                      label={`${t('nutrition.fat')} (${t('nutrition.aggressive').split(' ')[0]})`}
                      value={Math.round(
                        nutritionService.calculateFat(
                          results.bodyComposition.tdee * 1.15,
                          Number(formData.bodyFatPercentage),
                          formData.gender as 'male' | 'female'
                        )
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <MetricDisplay
                      label={`${t('nutrition.carbs')} (${t('nutrition.lean').split(' ')[0]})`}
                      value={Math.round(
                        (results.bodyComposition.tdee * 1.05 -
                          (results.nutrition.bulk.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 1.05,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                    <MetricDisplay
                      label={`${t('nutrition.carbs')} (${t('nutrition.aggressive').split(' ')[0]})`}
                      value={Math.round(
                        (results.bodyComposition.tdee * 1.15 -
                          (results.nutrition.bulk.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 1.15,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <MetricDisplay
                      label={`${t('nutrition.fiber')} (${t('nutrition.lean').split(' ')[0]})`}
                      value={getFiber(
                        (results.bodyComposition.tdee * 1.05 -
                          (results.nutrition.bulk.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 1.05,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                    <MetricDisplay
                      label={`${t('nutrition.fiber')} (${t('nutrition.aggressive').split(' ')[0]})`}
                      value={getFiber(
                        (results.bodyComposition.tdee * 1.15 -
                          (results.nutrition.bulk.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 1.15,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: 'cut',
              label: t('nutrition.cut'),
              content: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                  }}
                >
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <EnhancedMetricDisplay
                      label={t('nutrition.moderateCut')}
                      value={Math.round(results.bodyComposition.tdee * 0.95)}
                      unit="kcal"
                      variant="highlighted"
                      trend="down"
                      isDarkMode={isDarkMode}
                    />
                    <EnhancedMetricDisplay
                      label={t('nutrition.aggressiveCut')}
                      value={Math.round(results.bodyComposition.tdee * 0.85)}
                      unit="kcal"
                      variant="highlighted"
                      trend="down"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <EnhancedMetricDisplay
                    label={t('nutrition.protein')}
                    value={results.nutrition.cut.protein}
                    unit="g"
                    variant="highlighted"
                    isDarkMode={isDarkMode}
                  />
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <MetricDisplay
                      label={`${t('nutrition.fat')} (${t('nutrition.moderate')})`}
                      value={Math.round(
                        nutritionService.calculateFat(
                          results.bodyComposition.tdee * 0.95,
                          Number(formData.bodyFatPercentage),
                          formData.gender as 'male' | 'female'
                        )
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                    <MetricDisplay
                      label={`${t('nutrition.fat')} (${t('nutrition.aggressive').split(' ')[0]})`}
                      value={Math.round(
                        nutritionService.calculateFat(
                          results.bodyComposition.tdee * 0.85,
                          Number(formData.bodyFatPercentage),
                          formData.gender as 'male' | 'female'
                        )
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <MetricDisplay
                      label={`${t('nutrition.carbs')} (${t('nutrition.moderate')})`}
                      value={Math.round(
                        (results.bodyComposition.tdee * 0.95 -
                          (results.nutrition.cut.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 0.95,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                    <MetricDisplay
                      label={`${t('nutrition.carbs')} (${t('nutrition.aggressive').split(' ')[0]})`}
                      value={Math.round(
                        (results.bodyComposition.tdee * 0.85 -
                          (results.nutrition.cut.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 0.85,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div
                    className="nutrition-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <MetricDisplay
                      label={`${t('nutrition.fiber')} (${t('nutrition.moderate')})`}
                      value={getFiber(
                        (results.bodyComposition.tdee * 0.95 -
                          (results.nutrition.cut.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 0.95,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                    <MetricDisplay
                      label={`${t('nutrition.fiber')} (${t('nutrition.aggressive').split(' ')[0]})`}
                      value={getFiber(
                        (results.bodyComposition.tdee * 0.85 -
                          (results.nutrition.cut.protein * 4 +
                            nutritionService.calculateFat(
                              results.bodyComposition.tdee * 0.85,
                              Number(formData.bodyFatPercentage),
                              formData.gender as 'male' | 'female'
                            ) * 9)) /
                          4
                      )}
                      unit="g"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: 'maintain',
              label: t('nutrition.maintain'),
              content: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                  }}
                >
                  <EnhancedMetricDisplay
                    label={t('nutrition.maintenance')}
                    value={Math.round(results.bodyComposition.tdee)}
                    unit="kcal"
                    variant="highlighted"
                    isDarkMode={isDarkMode}
                  />
                  <EnhancedMetricDisplay
                    label={t('nutrition.protein')}
                    value={results.nutrition.maintain.protein}
                    unit="g"
                    variant="highlighted"
                    isDarkMode={isDarkMode}
                  />
                  <MetricDisplay
                    label={t('nutrition.fat')}
                    value={Math.round(
                      (results.bodyComposition.tdee * 0.25) / 9
                    )}
                    unit="g"
                    isDarkMode={isDarkMode}
                  />
                  <MetricDisplay
                    label={t('nutrition.carbs')}
                    value={Math.round(
                      (results.bodyComposition.tdee -
                        (results.nutrition.maintain.protein * 4 +
                          results.bodyComposition.tdee * 0.25)) /
                        4
                    )}
                    unit="g"
                    isDarkMode={isDarkMode}
                  />
                  <MetricDisplay
                    label={t('nutrition.fiber')}
                    value={getFiber(
                      (results.bodyComposition.tdee -
                        (results.nutrition.maintain.protein * 4 +
                          results.bodyComposition.tdee * 0.25)) /
                        4
                    )}
                    unit="g"
                    isDarkMode={isDarkMode}
                  />
                </div>
              ),
            },
            {
              id: 'recomp',
              label: t('nutrition.recomp'),
              content: (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                  }}
                >
                  <EnhancedMetricDisplay
                    label="Recomposition"
                    value={Math.round(results.bodyComposition.tdee * 1.05)}
                    unit="kcal"
                    variant="highlighted"
                    trend="up"
                    isDarkMode={isDarkMode}
                  />
                  <EnhancedMetricDisplay
                    label={t('nutrition.protein')}
                    value={results.nutrition.cut.protein}
                    unit="g"
                    variant="highlighted"
                    isDarkMode={isDarkMode}
                  />
                  <MetricDisplay
                    label={t('nutrition.fat')}
                    value={Math.round(
                      nutritionService.calculateFat(
                        results.bodyComposition.tdee * 1.05,
                        Number(formData.bodyFatPercentage),
                        formData.gender as 'male' | 'female'
                      )
                    )}
                    unit="g"
                    isDarkMode={isDarkMode}
                  />
                  <MetricDisplay
                    label={t('nutrition.carbs')}
                    value={Math.round(
                      (results.bodyComposition.tdee * 1.05 -
                        (results.nutrition.cut.protein * 4 +
                          nutritionService.calculateFat(
                            results.bodyComposition.tdee * 1.05,
                            Number(formData.bodyFatPercentage),
                            formData.gender as 'male' | 'female'
                          ) * 9)) /
                        4
                    )}
                    unit="g"
                    isDarkMode={isDarkMode}
                  />
                  <MetricDisplay
                    label={t('nutrition.fiber')}
                    value={getFiber(
                      (results.bodyComposition.tdee * 1.05 -
                        (results.nutrition.cut.protein * 4 +
                          nutritionService.calculateFat(
                            results.bodyComposition.tdee * 1.05,
                            Number(formData.bodyFatPercentage),
                            formData.gender as 'male' | 'female'
                          ) * 9)) /
                        4
                    )}
                    unit="g"
                    isDarkMode={isDarkMode}
                  />
                </div>
              ),
            },
          ]
        : [],
    [results, isDarkMode, t, formData.bodyFatPercentage, formData.gender, nutritionService]
  )

  return (
    <ErrorBoundary>
      <GlobalStyles />

      <AppContainer isDarkMode={isDarkMode}>
        <Header isDarkMode={isDarkMode}>
          <HeaderContent>
            <MainTitle isDarkMode={isDarkMode}>
              {t('app.title')}
            </MainTitle>
            <Subtitle isDarkMode={isDarkMode}>
              {t('app.subtitle')}
            </Subtitle>
          </HeaderContent>
        </Header>

        <Container>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '32px',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

              <Tooltip content={`${t('commandCenter.title')} - ${t('commandCenter.language')}, ${t('commandCenter.theme')} & ${t('commandCenter.unitSystem')}`}>
                <button
                  onClick={() => setShowCommandCenter(true)}
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.05) 100%)',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.15)'}`,
                    borderRadius: '16px',
                    padding: '12px 16px',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    backdropFilter: 'blur(16px)',
                    boxShadow: isDarkMode
                      ? '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ⚬ {t('ui.settings')}
                </button>
              </Tooltip>
            </div>
          </div>
          <FormCard isDarkMode={isDarkMode} style={{ marginBottom: '40px' }}>

            {showAdvanced && (
              <div
                style={{
                  padding: '20px 32px',
                  borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  marginBottom: '24px',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(9, 9, 11, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(248, 250, 252, 0.5) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '16px 16px 0 0',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#9ca3af' : '#64748b',
                    }}
                  >
                    {t('ui.advancedMode')}
                  </span>
                  {results && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {EXPORT_FORMATS.map(format => (
                          <Tooltip key={format} content={`${t('ui.exportAs')} ${format}`}>
                            <button
                              onClick={() => {
                                const data = {
                                  client: {
                                    name: formData.name || t('labels.anonymous'),
                                    exportDate: new Date().toISOString(),
                                    reportId: `BR-${Date.now()}`,
                                    version: '0.1.0-pre'
                                  },
                                  inputs: {
                                    gender: formData.gender,
                                    weight: `${formData.weight} kg`,
                                    height: `${formData.height} cm`,
                                    age: `${formData.age} years`,
                                    bodyFatPercentage: `${formData.bodyFatPercentage}%`,
                                    activityLevel: formData.activityLevel
                                  },
                                  results: {
                                    bmr: `${Math.round(results.bodyComposition.bmr)} kcal/day`,
                                    tdee: `${Math.round(results.bodyComposition.tdee)} kcal/day`,
                                    bmi: `${results.bodyComposition.bmi.toFixed(1)} (${getBMICategory(results.bodyComposition.bmi)})`,
                                    leanBodyMass: `${results.bodyComposition.leanBodyMass.toFixed(1)} kg`,
                                    fatMass: `${(Number(formData.weight) - results.bodyComposition.leanBodyMass).toFixed(1)} kg`
                                  },
                                  nutrition: {
                                    bulk: {
                                      calories: `${Math.round(results.bodyComposition.tdee * 1.15)} kcal`,
                                      protein: `${results.nutrition.bulk.protein}g`,
                                      fat: `${Math.round((results.bodyComposition.tdee * 1.15 * 0.25) / 9)}g`,
                                      carbs: `${Math.round((results.bodyComposition.tdee * 1.15 - (results.nutrition.bulk.protein * 4 + results.bodyComposition.tdee * 1.15 * 0.25)) / 4)}g`
                                    },
                                    cut: {
                                      calories: `${Math.round(results.bodyComposition.tdee * 0.9)} kcal`,
                                      protein: `${results.nutrition.cut.protein}g`,
                                      fat: `${Math.round((results.bodyComposition.tdee * 0.9 * 0.25) / 9)}g`,
                                      carbs: `${Math.round((results.bodyComposition.tdee * 0.9 - (results.nutrition.cut.protein * 4 + results.bodyComposition.tdee * 0.9 * 0.25)) / 4)}g`
                                    },
                                    maintain: {
                                      calories: `${Math.round(results.bodyComposition.tdee)} kcal`,
                                      protein: `${results.nutrition.maintain.protein}g`,
                                      fat: `${Math.round((results.bodyComposition.tdee * 0.25) / 9)}g`,
                                      carbs: `${Math.round((results.bodyComposition.tdee - (results.nutrition.maintain.protein * 4 + results.bodyComposition.tdee * 0.25)) / 4)}g`
                                    },
                                    recomp: {
                                      calories: `${Math.round(results.bodyComposition.tdee * 1.05)} kcal`,
                                      protein: `${results.nutrition.cut.protein}g`,
                                      fat: `${Math.round(nutritionService.calculateFat(results.bodyComposition.tdee * 1.05, Number(formData.bodyFatPercentage), formData.gender as 'male' | 'female'))}g`,
                                      carbs: `${Math.round((results.bodyComposition.tdee * 1.05 - (results.nutrition.cut.protein * 4 + nutritionService.calculateFat(results.bodyComposition.tdee * 1.05, Number(formData.bodyFatPercentage), formData.gender as 'male' | 'female') * 9)) / 4)}g`
                                    }
                                  },
                                  hydration: {
                                    maintenance: `${getHydration().maintenance.toFixed(2)}L`,
                                    training: `${getHydration().training.toFixed(2)}L`
                                  },
                                  heartRate: {
                                    maximum: `${220 - Number(formData.age)} bpm`,
                                    liss: `${Math.round((220 - Number(formData.age)) * 0.6)} bpm`
                                  }
                                };
                                import('./services/ExportService').then(({ ExportService }) => {
                                  const exportMethod = format === 'JSON' ? ExportService.exportJSON :
                                                     format === 'CSV' ? ExportService.exportCSV :
                                                     format === 'XML' ? ExportService.exportXML :
                                                     ExportService.exportTXT
                                  exportMethod(data, `nutrition-${Date.now()}`)
                                  audit.logExport(format, JSON.stringify(data).length)
                                  setNotification({ message: `${format} ${t('messages.exported')}`, type: 'success', isVisible: true })
                                })
                              }}
                              style={{
                                padding: '6px 10px',
                                fontSize: '10px',
                                borderRadius: '8px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                                e.currentTarget.style.transform = 'scale(1.05)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              {format}
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Tooltip content={t('ui.disableAdvanced')}>
                  <button
                    onClick={() => setShowAdvanced(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isDarkMode ? '#6b7280' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px',
                    }}
                  >
                    ×
                  </button>
                </Tooltip>
              </div>
            )}

            {!showAdvanced && (
              <div style={{ padding: '16px 32px', marginBottom: '24px' }}>
                <Tooltip content={t('ui.enableAdvancedFeatures')}>
                  <button
                    onClick={() => setShowAdvanced(true)}
                    style={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
                      border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
                      color: '#10b981',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      padding: '12px 20px',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform =
                        'translateY(-2px) scale(1.02)'
                      e.currentTarget.style.borderColor =
                        'rgba(16, 185, 129, 0.4)'
                      e.currentTarget.style.boxShadow =
                        '0 8px 24px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.borderColor = isDarkMode
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(16, 185, 129, 0.15)'
                      e.currentTarget.style.boxShadow =
                        '0 4px 16px rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    {t('ui.enableAdvanced')}
                  </button>
                </Tooltip>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                }}
              >
                {showAdvanced && (
                  <Tooltip content={t('tooltips.clientName')}>
                    <Input
                      label={t('labels.clientNameOptional')}
                      type="text"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder={t('labels.enterClientName')}
                      isDarkMode={isDarkMode}
                    />
                  </Tooltip>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '24px',
                    alignItems: 'start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '16px',
                      }}
                    >
                      <Tooltip content={t('tooltips.genderAffects')}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              marginBottom: '12px',
                              fontSize: '13px',
                              color: isDarkMode ? '#9ca3af' : '#374151',
                              fontWeight: 500,
                              cursor: 'help',
                            }}
                          >
                            {t('form.gender')}
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {['male', 'female'].map(g => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => handleInputChange('gender', g)}
                                style={{
                                  flex: 1,
                                  padding: '16px 20px',
                                  background:
                                    formData.gender === g
                                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                      : isDarkMode
                                        ? 'rgba(15, 15, 15, 0.8)'
                                        : 'rgba(248, 250, 252, 0.9)',
                                  border: `1px solid ${formData.gender === g ? '#10b981' : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                  borderRadius: '16px',
                                  color:
                                    formData.gender === g
                                      ? '#ffffff'
                                      : isDarkMode
                                        ? '#d1d5db'
                                        : '#475569',
                                  fontSize: '14px',
                                  fontWeight: formData.gender === g ? 600 : 500,
                                  cursor: 'pointer',
                                  textTransform: 'capitalize',
                                  transition:
                                    'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  backdropFilter: 'blur(12px)',
                                  boxShadow:
                                    formData.gender === g
                                      ? '0 8px 32px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                      : '0 4px 16px rgba(0, 0, 0, 0.08)',
                                }}
                                onMouseEnter={e => {
                                  if (formData.gender !== g) {
                                    e.currentTarget.style.transform =
                                      'translateY(-2px)'
                                    e.currentTarget.style.borderColor =
                                      'rgba(16, 185, 129, 0.3)'
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (formData.gender !== g) {
                                    e.currentTarget.style.transform =
                                      'translateY(0)'
                                    e.currentTarget.style.borderColor =
                                      isDarkMode
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(0, 0, 0, 0.1)'
                                  }
                                }}
                              >
                                {t(`form.${g}`)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </Tooltip>

                      <Tooltip content={t('tooltips.ageAffects')}>
                        <Input
                          label={t('form.age')}
                          type="number"
                          value={formData.age}
                          onChange={e =>
                            handleInputChange('age', e.target.value)
                          }
                          placeholder="25"
                          min="16"
                          max="80"
                          required
                          isDarkMode={isDarkMode}
                        />
                      </Tooltip>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                      }}
                    >
                      <Tooltip content={useMetric ? t('tooltips.currentWeight') : t('tooltips.currentWeightLbs')}>
                        <Input
                          label={useMetric ? t('form.weight') : t('labels.weightLbs')}
                          type="number"
                          value={formData.weight}
                          onChange={e =>
                            handleInputChange('weight', e.target.value)
                          }
                          placeholder={useMetric ? "70" : "154"}
                          min={UnitConversionService.getWeightRange(useMetric).min.toString()}
                          max={UnitConversionService.getWeightRange(useMetric).max.toString()}
                          step="0.1"
                          required
                          isDarkMode={isDarkMode}
                        />
                      </Tooltip>

                      <Tooltip content={useMetric ? t('tooltips.heightCm') : t('tooltips.heightFt')}>
                        <Input
                          label={useMetric ? t('form.height') : t('labels.heightFt')}
                          type="number"
                          value={formData.height}
                          onChange={e =>
                            handleInputChange('height', e.target.value)
                          }
                          placeholder={useMetric ? "175" : "5.9"}
                          min={UnitConversionService.getHeightRange(useMetric).min.toString()}
                          max={UnitConversionService.getHeightRange(useMetric).max.toString()}
                          step={useMetric ? "1" : "0.1"}
                          required
                          isDarkMode={isDarkMode}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Tooltip content={t('tooltips.bodyFatEssential')}>
                      <div
                        style={{
                          padding: '24px',
                          background: isDarkMode
                            ? 'rgba(15, 15, 15, 0.6)'
                            : 'rgba(248, 250, 252, 0.8)',
                          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                          borderRadius: '20px',
                          backdropFilter: 'blur(12px)',
                          textAlign: 'center',
                        }}
                      >
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '16px',
                            fontSize: '13px',
                            color: isDarkMode ? '#9ca3af' : '#374151',
                            fontWeight: 500,
                          }}
                        >
                          {t('form.bodyFat')}
                          {formData.gender && (
                            <span
                              style={{
                                color: '#10b981',
                                fontSize: '12px',
                                display: 'block',
                                marginTop: '4px',
                              }}
                            >
                              {formData.gender === 'male' ? '10-20%' : '18-28%'}{' '}
                              {t('ui.range')}
                            </span>
                          )}
                        </label>
                        {formData.gender ? (
                          <>
                            <div
                              style={{
                                fontSize: '32px',
                                fontWeight: 700,
                                color: '#10b981',
                                marginBottom: '16px',
                                background:
                                  'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                            >
                              {formData.bodyFatPercentage ||
                                (formData.gender === 'male' ? 15 : 23)}
                              %
                            </div>
                            <div style={{ marginTop: '16px', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', color: isDarkMode ? '#6b7280' : '#64748b' }}>{t('ui.inputMode')}:</span>
                                <button
                                  type="button"
                                  onClick={() => setUseSliders(!useSliders)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    borderRadius: '6px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {useSliders ? t('ui.slider') : t('ui.keyboard')}
                                </button>
                              </div>
                              {useSliders ? (
                                <div style={{ position: 'relative' }}>
                                  <input
                                    type="range"
                                    min={formData.gender === 'male' ? 10 : 18}
                                    max={formData.gender === 'male' ? 20 : 28}
                                    step={0.5}
                                    value={formData.bodyFatPercentage || (formData.gender === 'male' ? 15 : 23)}
                                    onChange={e => handleInputChange('bodyFatPercentage', e.target.value)}
                                    style={{
                                      width: '100%',
                                      height: '8px',
                                      background: isDarkMode ? '#374151' : '#e5e7eb',
                                      borderRadius: '4px',
                                      outline: 'none',
                                      WebkitAppearance: 'none',
                                      cursor: 'pointer',
                                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                                    }}
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    left: `${((Number(formData.bodyFatPercentage) || (formData.gender === 'male' ? 15 : 23)) - (formData.gender === 'male' ? 10 : 18)) / ((formData.gender === 'male' ? 20 : 28) - (formData.gender === 'male' ? 10 : 18)) * 100}%`,
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                  }}>
                                    {formData.bodyFatPercentage || (formData.gender === 'male' ? 15 : 23)}%
                                  </div>
                                </div>
                              ) : (
                                <Input
                                  type="number"
                                  min={formData.gender === 'male' ? 10 : 18}
                                  max={formData.gender === 'male' ? 20 : 28}
                                  step={0.5}
                                  value={formData.bodyFatPercentage || (formData.gender === 'male' ? 15 : 23)}
                                  onChange={e => handleInputChange('bodyFatPercentage', e.target.value)}
                                  placeholder={formData.gender === 'male' ? '15' : '23'}
                                  isDarkMode={isDarkMode}
                                  style={{
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#10b981'
                                  }}
                                />
                              )}
                              <style>{`
                                input[type="range"]::-webkit-slider-thumb {
                                  -webkit-appearance: none;
                                  width: 24px;
                                  height: 24px;
                                  border-radius: 50%;
                                  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                                  cursor: pointer;
                                  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.1);
                                  border: none;
                                  transition: all 0.2s ease;
                                }
                                input[type="range"]::-webkit-slider-thumb:hover {
                                  transform: scale(1.1);
                                  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.15);
                                }
                                input[type="range"]::-moz-range-thumb {
                                  width: 24px;
                                  height: 24px;
                                  border-radius: 50%;
                                  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                                  cursor: pointer;
                                  border: none;
                                  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                                }
                              `}</style>
                            </div>
                          </>
                        ) : (
                          <div
                            style={{
                              padding: '32px 16px',
                              color: isDarkMode ? '#6b7280' : '#64748b',
                              fontSize: '14px',
                              border: `2px dashed ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                              borderRadius: '12px',
                              background: isDarkMode
                                ? 'rgba(9, 9, 11, 0.4)'
                                : 'rgba(255, 255, 255, 0.5)',
                            }}
                          >
                            {t('ui.selectGenderFirst')}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <div>
                  <Tooltip content={t('tooltips.activityFrequency')}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '13px',
                        color: isDarkMode ? '#9ca3af' : '#64748b',
                        fontWeight: 500,
                        cursor: 'help',
                      }}
                    >
                      {t('form.activityLevel')}
                    </label>
                  </Tooltip>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    {[
                      {
                        value: 'sedentary',
                        label: t('activity.sedentary'),
                        desc: t('activity.sedentaryDesc'),
                      },
                      {
                        value: 'lightlyActive',
                        label: t('activity.light'),
                        desc: t('activity.lightDesc'),
                      },
                      {
                        value: 'moderatelyActive',
                        label: t('activity.moderate'),
                        desc: t('activity.moderateDesc'),
                      },
                      {
                        value: 'highlyActive',
                        label: t('activity.high'),
                        desc: t('activity.highDesc'),
                      },
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleInputChange('activityLevel', option.value)
                        }
                        style={{
                          padding: '16px 12px',
                          background:
                            formData.activityLevel === option.value
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : isDarkMode
                                ? 'rgba(9, 9, 11, 0.8)'
                                : 'rgba(248, 250, 252, 0.8)',
                          border: `1px solid ${formData.activityLevel === option.value ? '#10b981' : isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.15)'}`,
                          borderRadius: '16px',
                          color:
                            formData.activityLevel === option.value
                              ? '#ffffff'
                              : isDarkMode
                                ? '#d1d5db'
                                : '#475569',
                          fontSize: '13px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontWeight:
                            formData.activityLevel === option.value ? 600 : 500,
                          position: 'relative',
                          overflow: 'hidden',
                          backdropFilter: 'blur(8px)',
                          boxShadow:
                            formData.activityLevel === option.value
                              ? '0 12px 32px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              : '0 4px 16px rgba(0, 0, 0, 0.1)',
                        }}
                        onMouseEnter={e => {
                          if (formData.activityLevel !== option.value) {
                            e.currentTarget.style.transform =
                              'translateY(-3px) scale(1.02)'
                            e.currentTarget.style.borderColor =
                              'rgba(16, 185, 129, 0.3)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (formData.activityLevel !== option.value) {
                            e.currentTarget.style.transform =
                              'translateY(0) scale(1)'
                            e.currentTarget.style.borderColor = isDarkMode
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.15)'
                          }
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                          }}
                        >
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background:
                                formData.activityLevel === option.value
                                  ? '#10b981'
                                  : 'rgba(255, 255, 255, 0.3)',
                              transition: 'all 0.3s ease',
                            }}
                          />
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>
                            {option.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            opacity: 0.8,
                            marginLeft: '20px',
                          }}
                        >
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <Button
                  type="submit"
                  loading={loading}
                  style={{
                    width: '100%',
                    padding: '24px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '24px',
                    background: loading
                      ? 'rgba(15, 15, 15, 0.8)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 30%, #3b82f6 70%, #8b5cf6 100%)',
                    border: loading
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : 'none',
                    boxShadow: loading
                      ? 'none'
                      : '0 24px 48px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.transform =
                        'translateY(-4px) scale(1.02)'
                      e.currentTarget.style.boxShadow =
                        '0 32px 64px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.boxShadow =
                        '0 24px 48px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    }
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          borderTop: '2px solid #10b981',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      {t('messages.analyzing')}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                      }}
                    >
                      {t('form.generateAnalysis')}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </FormCard>

          {validation && !validation.isValid && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: '32px',
                maxWidth: '600px',
                margin: '0 auto 32px',
                padding: '24px',
                background:
                  'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <h3
                  style={{
                    margin: 0,
                    color: '#ef4444',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  {t('ui.validationErrors')}
                </h3>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  color: isDarkMode ? '#fca5a5' : '#dc2626',
                  fontSize: '14px',
                }}
              >
                {validation.errors.map((error: string, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>•</span>
                    {error}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center',
                marginBottom: '32px',
                padding: '80px 40px',
                background: isDarkMode
                  ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%), radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%), radial-gradient(ellipse at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                borderRadius: '24px',
                backdropFilter: 'blur(32px)',
                boxShadow: isDarkMode
                  ? '0 32px 64px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 32px 64px -12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.6) 25%, rgba(59, 130, 246, 0.6) 50%, rgba(139, 92, 246, 0.6) 75%, transparent 100%)',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '24px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid rgba(16, 185, 129, 0.2)',
                    borderTop: '3px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <div
                  style={{
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    fontSize: '18px',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    background:
                      'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('messages.analyzingBody')}
                </div>
                <div
                  style={{
                    color: isDarkMode ? '#9ca3af' : '#64748b',
                    fontSize: '14px',
                    fontWeight: 400,
                    opacity: 0.8,
                  }}
                >
                  {t('messages.takeMoments')}
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <InteractiveCard
                      title={t('results.bmr')}
                      badge={t('badges.essential')}
                      variant="premium"
                      isDarkMode={isDarkMode}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                        }}
                      >
                        <CircularProgress percentage={75} size={80}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#10b981',
                            }}
                          >
                            75%
                          </div>
                        </CircularProgress>
                        <div style={{ flex: 1 }}>
                          <StatValue>
                            {Math.round(results.bodyComposition.bmr)}
                          </StatValue>
                          <div
                            style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#6b7280' : '#64748b',
                              marginTop: '8px',
                              lineHeight: 1.4,
                              fontWeight: 300,
                              opacity: 0.9,
                            }}
                          >
                            {t('descriptions.caloriesBurnedRest')}
                          </div>
                        </div>
                      </div>
                    </InteractiveCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <InteractiveCard
                      title={t('results.tdee')}
                      badge={t('badges.primary')}
                      variant="elite"
                      isDarkMode={isDarkMode}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                        }}
                      >
                        <CircularProgress percentage={90} size={80}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#8b5cf6',
                            }}
                          >
                            90%
                          </div>
                        </CircularProgress>
                        <div style={{ flex: 1 }}>
                          <StatValue>
                            {Math.round(results.bodyComposition.tdee)}
                          </StatValue>
                          <div
                            style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#6b7280' : '#64748b',
                              marginTop: '8px',
                              lineHeight: 1.4,
                              fontWeight: 300,
                              opacity: 0.9,
                            }}
                          >
                            {t('descriptions.totalCaloriesBurned')}
                          </div>
                        </div>
                      </div>
                    </InteractiveCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <InteractiveCard
                      title={t('results.bmi')}
                      badge={t('badges.health')}
                      variant="premium"
                      isDarkMode={isDarkMode}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                        }}
                      >
                        <CircularProgress
                          percentage={
                            results.bodyComposition.bmi < 25 ? 85 : 60
                          }
                          size={80}
                        >
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color:
                                results.bodyComposition.bmi < 25
                                  ? '#10b981'
                                  : '#f59e0b',
                            }}
                          >
                            {results.bodyComposition.bmi < 25 ? '85%' : '60%'}
                          </div>
                        </CircularProgress>
                        <div style={{ flex: 1 }}>
                          <StatValue>
                            {results.bodyComposition.bmi.toFixed(1)}
                          </StatValue>
                          <div
                            style={{
                              marginTop: '8px',
                              display: 'flex',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <Tooltip
                              content={`BMI: ${results.bodyComposition.bmi.toFixed(1)} - ${getBMICategory(results.bodyComposition.bmi)}`}
                            >
                              <span
                                style={{
                                  fontSize: '11px',
                                  color:
                                    results.bodyComposition.bmi < 18.5
                                      ? '#f59e0b'
                                      : results.bodyComposition.bmi < 25
                                        ? '#10b981'
                                        : results.bodyComposition.bmi < 30
                                          ? '#f59e0b'
                                          : '#ef4444',
                                  fontWeight: 500,
                                  cursor: 'help',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background:
                                    results.bodyComposition.bmi < 18.5
                                      ? 'rgba(245, 158, 11, 0.1)'
                                      : results.bodyComposition.bmi < 25
                                        ? 'rgba(16, 185, 129, 0.1)'
                                        : results.bodyComposition.bmi < 30
                                          ? 'rgba(245, 158, 11, 0.1)'
                                          : 'rgba(239, 68, 68, 0.1)',
                                  border: `1px solid ${
                                    results.bodyComposition.bmi < 18.5
                                      ? 'rgba(245, 158, 11, 0.2)'
                                      : results.bodyComposition.bmi < 25
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : results.bodyComposition.bmi < 30
                                          ? 'rgba(245, 158, 11, 0.2)'
                                          : 'rgba(239, 68, 68, 0.2)'
                                  }`,
                                }}
                              >
                                {getBMICategory(results.bodyComposition.bmi)}
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </InteractiveCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <InteractiveCard
                      title={t('results.leanMass')}
                      badge={t('badges.muscle')}
                      variant="premium"
                      isDarkMode={isDarkMode}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                        }}
                      >
                        <CircularProgress percentage={80} size={80}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#10b981',
                            }}
                          >
                            80%
                          </div>
                        </CircularProgress>
                        <div style={{ flex: 1 }}>
                          <StatValue>
                            {results.bodyComposition.leanBodyMass.toFixed(1)}
                          </StatValue>
                          <div
                            style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#6b7280' : '#64748b',
                              marginTop: '8px',
                              lineHeight: 1.4,
                              fontWeight: 300,
                              opacity: 0.9,
                            }}
                          >
                            {t('descriptions.muscleBoneOrgans')}
                          </div>
                        </div>
                      </div>
                    </InteractiveCard>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="results-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: '24px',
                  }}
                >
                  <ResultCard
                    isDarkMode={isDarkMode}
                    title={t('tabs.nutritionAnalytics')}
                    style={{ minWidth: '500px' }}
                  >
                    <Tabs
                      tabs={nutritionTabs}
                      defaultTab="maintain"
                      isDarkMode={isDarkMode}
                    />
                  </ResultCard>

                  <ResultCard
                    isDarkMode={isDarkMode}
                    title={t('tabs.hydrationSupplementation')}
                    style={{ minWidth: '500px' }}
                  >
                    <Tabs
                      tabs={[
                        {
                          id: 'hydration',
                          label: t('hydration.title'),
                          content: (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              }}
                            >
                              <MetricDisplay
                                label={t('hydration.regularDays')}
                                value={hydration.maintenance.toFixed(2)}
                                unit="L"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('hydration.trainingDays')}
                                value={hydration.training.toFixed(2)}
                                unit="L"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('hydration.preWorkout')}
                                value={hydration.pre.toFixed(2)}
                                unit="L"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('hydration.intraWorkout')}
                                value={hydration.intra.toFixed(2)}
                                unit="L"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('hydration.postWorkout')}
                                value={hydration.post.toFixed(2)}
                                unit="L"
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          ),
                        },
                        {
                          id: 'supplements',
                          label: t('supplements.dailySupplementation').split(' ')[0],
                          content: (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                              }}
                            >
                              <div>
                                <h4
                                  style={{
                                    margin: '0 0 12px 0',
                                    color: isDarkMode ? '#ffffff' : '#000000',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    letterSpacing: '0.01em',
                                  }}
                                >
                                  <GradientText
                                    variant="primary"
                                    weight="semibold"
                                  >
                                    {t('supplements.dailySupplementation')}
                                  </GradientText>
                                </h4>
                                <MetricDisplay
                                  label={t('supplements.multivitamin')}
                                  value="1"
                                  unit={t('supplements.pill')}
                                  isDarkMode={isDarkMode}
                                />
                                <MetricDisplay
                                  label={t('supplements.omega3')}
                                  value="2"
                                  unit="g"
                                  isDarkMode={isDarkMode}
                                />
                                <MetricDisplay
                                  label={t('supplements.vitaminD')}
                                  value="5,000"
                                  unit="IU"
                                  isDarkMode={isDarkMode}
                                />
                                <MetricDisplay
                                  label={t('supplements.magnesium')}
                                  value="140"
                                  unit="mg"
                                  isDarkMode={isDarkMode}
                                />
                                <MetricDisplay
                                  label={t('supplements.creatine')}
                                  value="5"
                                  unit="g"
                                  isDarkMode={isDarkMode}
                                />
                                <MetricDisplay
                                  label={t('supplements.ashwagandha')}
                                  value="600"
                                  unit="mg"
                                  isDarkMode={isDarkMode}
                                />
                                <MetricDisplay
                                  label={t('supplements.proteinPowder')}
                                  value={t('supplements.asNeeded')}
                                  unit=""
                                  isDarkMode={isDarkMode}
                                />
                              </div>
                              <div>
                                <h4
                                  style={{
                                    margin: '20px 0 12px 0',
                                    color: '#f9fafb',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    letterSpacing: '0.01em',
                                  }}
                                >
                                  <GradientText
                                    variant="secondary"
                                    weight="semibold"
                                  >
                                    {t('supplements.trainingDayProtocol')}
                                  </GradientText>
                                </h4>

                                <CaffeineBreakdown
                                  weight={UnitConversionService.convertWeightToMetric(Number(formData.weight), useMetric)}
                                  multiplier={CAFFEINE_INTAKE.TRAINING_DAY / UnitConversionService.convertWeightToMetric(Number(formData.weight), useMetric)}
                                  isDarkMode={isDarkMode}
                                  type="training"
                                />
                              </div>
                              <div>
                                <h4
                                  style={{
                                    margin: '20px 0 12px 0',
                                    color: '#f9fafb',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    letterSpacing: '0.01em',
                                  }}
                                >
                                  <GradientText
                                    variant="accent"
                                    weight="semibold"
                                  >
                                    {t('supplements.restDayProtocol')}
                                  </GradientText>
                                </h4>
                                <CaffeineBreakdown
                                  weight={UnitConversionService.convertWeightToMetric(Number(formData.weight), useMetric)}
                                  multiplier={CAFFEINE_INTAKE.REST_DAY / UnitConversionService.convertWeightToMetric(Number(formData.weight), useMetric)}
                                  isDarkMode={isDarkMode}
                                  type="rest"
                                />
                              </div>
                              <div
                                style={{
                                  marginTop: '24px',
                                  padding: '16px',
                                  background: 'rgba(16, 185, 129, 0.06)',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(16, 185, 129, 0.15)',
                                  backdropFilter: 'blur(8px)',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#10b981',
                                    fontWeight: '500',
                                    letterSpacing: '0.01em',
                                  }}
                                >
                                  💡 {t('supplements.caffeineNote')}
                                </div>
                              </div>
                            </div>
                          ),
                        },
                      ]}
                      defaultTab="hydration"
                      isDarkMode={isDarkMode}
                    />
                  </ResultCard>

                  <ResultCard
                    isDarkMode={isDarkMode}
                    title={t('tabs.biometricAnalysis')}
                    style={{ minWidth: '500px' }}
                  >
                    <Tabs
                      tabs={[
                        {
                          id: 'heart-rate',
                          label: t('heartRate.title'),
                          content: (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              }}
                            >
                              <MetricDisplay
                                label={t('heartRate.maximum')}
                                value={220 - Number(formData.age)}
                                unit="bpm"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('heartRate.liss')}
                                value={Math.round(
                                  (220 - Number(formData.age)) * 0.6
                                )}
                                unit="bpm"
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          ),
                        },
                        {
                          id: 'body-comp',
                          label: t('composition.composition'),
                          content: (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              }}
                            >
                              <MetricDisplay
                                label={t('results.bmi')}
                                value={results.bodyComposition.bmi.toFixed(1)}
                                unit=""
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('results.bmr')}
                                value={Math.round(results.bodyComposition.bmr)}
                                unit="kcal/day"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('results.tdee')}
                                value={Math.round(results.bodyComposition.tdee)}
                                unit="kcal/day"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={t('results.leanMass')}
                                value={results.bodyComposition.leanBodyMass.toFixed(
                                  1
                                )}
                                unit="kg"
                                isDarkMode={isDarkMode}
                              />
                              <MetricDisplay
                                label={`${t('composition.bodyFat')} Mass`}
                                value={(
                                  Number(formData.weight) -
                                  results.bodyComposition.leanBodyMass
                                ).toFixed(1)}
                                unit="kg"
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          ),
                        },
                      ]}
                      defaultTab="heart-rate"
                      isDarkMode={isDarkMode}
                    />
                  </ResultCard>

                  {formData.gender === 'male' && (
                    <ResultCard
                      isDarkMode={isDarkMode}
                      title={t('tabs.bodyCompositionGoals')}
                      style={{ minWidth: '500px' }}
                    >
                      <Tabs
                        tabs={[
                          {
                            id: 'fit-attractive',
                            label: t('composition.fit'),
                            content: (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                }}
                              >
                                <div>
                                  <h4
                                    style={{
                                      margin: '0 0 16px 0',
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      letterSpacing: '0.01em',
                                    }}
                                  >
                                    {t('composition.targetWeightRanges')}
                                  </h4>
                                  <MetricDisplay
                                    label={`${t('composition.minimum')} (BMI 23)`}
                                    value={useMetric ? (
                                      23 *
                                      (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                    ).toFixed(1) : (
                                      UnitConversionService.kgToLbs(
                                        23 * (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                      )
                                    ).toFixed(1)}
                                    unit={useMetric ? "kg" : "lbs"}
                                    isDarkMode={isDarkMode}
                                  />
                                  <MetricDisplay
                                    label={`${t('composition.maximum')} (BMI 25)`}
                                    value={useMetric ? (
                                      25 *
                                      (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                    ).toFixed(1) : (
                                      UnitConversionService.kgToLbs(
                                        25 * (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                      )
                                    ).toFixed(1)}
                                    unit={useMetric ? "kg" : "lbs"}
                                    isDarkMode={isDarkMode}
                                  />
                                  <MetricDisplay
                                    label={`${t('composition.ideal')} (BMI 24.5)`}
                                    value={useMetric ? (
                                      24.5 *
                                      (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                    ).toFixed(1) : (
                                      UnitConversionService.kgToLbs(
                                        24.5 * (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                      )
                                    ).toFixed(1)}
                                    unit={useMetric ? "kg" : "lbs"}
                                    isDarkMode={isDarkMode}
                                  />
                                </div>

                              </div>
                            ),
                          },
                          {
                            id: 'strong-aesthetic',
                            label: t('composition.strong'),
                            content: (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                }}
                              >
                                <div>
                                  <h4
                                    style={{
                                      margin: '0 0 16px 0',
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      letterSpacing: '0.01em',
                                    }}
                                  >
                                    {t('composition.targetWeightRanges')}
                                  </h4>
                                  <MetricDisplay
                                    label={`${t('composition.minimum')} (BMI 25)`}
                                    value={useMetric ? (
                                      25 *
                                      (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                    ).toFixed(1) : (
                                      UnitConversionService.kgToLbs(
                                        25 * (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                      )
                                    ).toFixed(1)}
                                    unit={useMetric ? "kg" : "lbs"}
                                    isDarkMode={isDarkMode}
                                  />
                                  <MetricDisplay
                                    label={`${t('composition.maximum')} (BMI 27)`}
                                    value={useMetric ? (
                                      27 *
                                      (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                    ).toFixed(1) : (
                                      UnitConversionService.kgToLbs(
                                        27 * (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                      )
                                    ).toFixed(1)}
                                    unit={useMetric ? "kg" : "lbs"}
                                    isDarkMode={isDarkMode}
                                  />
                                  <MetricDisplay
                                    label={`${t('composition.ideal')} (BMI 25.9)`}
                                    value={useMetric ? (
                                      25.9 *
                                      (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                    ).toFixed(1) : (
                                      UnitConversionService.kgToLbs(
                                        25.9 * (UnitConversionService.convertHeightToMetric(Number(formData.height), useMetric) / 100) ** 2
                                      )
                                    ).toFixed(1)}
                                    unit={useMetric ? "kg" : "lbs"}
                                    isDarkMode={isDarkMode}
                                  />
                                </div>

                              </div>
                            ),
                          },
                        ]}
                        defaultTab="fit-attractive"
                        isDarkMode={isDarkMode}
                      />

                    </ResultCard>
                  )}
                </motion.div>


              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: '40px',
                maxWidth: '600px',
                margin: '40px auto 0',
                padding: '32px',
                background:
                  'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 16px 48px rgba(239, 68, 68, 0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                }}
              >
                🚨
              </div>
              <h3
                style={{
                  margin: '0 0 12px 0',
                  color: '#ef4444',
                  fontSize: '18px',
                  fontWeight: 600,
                }}
              >
                {t('ui.systemError')}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: isDarkMode ? '#fca5a5' : '#dc2626',
                  fontSize: '14px',
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            </motion.div>
          )}
        </Container>

        <NotificationToast
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() =>
            setNotification(prev => ({ ...prev, isVisible: false }))
          }
        />

        <ScrollToTop />
        <EnterpriseDebugPanel isDarkMode={isDarkMode} />

        <EnterpriseCommandCenter
          key={showCommandCenter ? 'open' : 'closed'}
          isDarkMode={isDarkMode}
          isOpen={showCommandCenter}
          onClose={() => setShowCommandCenter(false)}
          useMetric={useMetric}
          onEnableAdvanced={() => setShowAdvanced(true)}
          onReset={reset}
          onUnitChange={(newUseMetric) => {
            logger.trackUserAction('unit_toggle', 'CommandCenter', { from: useMetric ? 'metric' : 'imperial', to: newUseMetric ? 'metric' : 'imperial' })
            audit.logUserAction('unit_system_changed', { from: useMetric ? 'metric' : 'imperial', to: newUseMetric ? 'metric' : 'imperial' })

            // Convert existing form values
            setFormData(prev => {
              const newData = { ...prev }

              // Convert weight
              if (prev.weight) {
                const weightNum = Number(prev.weight)
                if (newUseMetric) {
                  // Converting from imperial to metric
                  newData.weight = UnitConversionService.lbsToKg(weightNum).toFixed(1)
                } else {
                  // Converting from metric to imperial
                  newData.weight = UnitConversionService.kgToLbs(weightNum).toFixed(1)
                }
              }

              // Convert height
              if (prev.height) {
                const heightNum = Number(prev.height)
                if (newUseMetric) {
                  // Converting from imperial to metric
                  newData.height = UnitConversionService.feetToCm(heightNum).toFixed(0)
                } else {
                  // Converting from metric to imperial
                  newData.height = UnitConversionService.cmToFeet(heightNum).toFixed(1)
                }
              }

              return newData
            })

            setUseMetric(newUseMetric)
          }}
          onThemeChange={(isDark) => {
            logger.trackUserAction('theme_toggle', 'CommandCenter', { from: isDarkMode ? 'dark' : 'light', to: isDark ? 'dark' : 'light' })
            audit.logUserAction('theme_changed', { from: isDarkMode ? 'dark' : 'light', to: isDark ? 'dark' : 'light' })
            setIsDarkMode(isDark)
          }}
        />
        <EnterpriseStatusBar isDarkMode={isDarkMode} />
      </AppContainer>
    </ErrorBoundary>
  )
}

export default App
