import { UserMetrics } from '../types'
import { UnitConversionService } from './UnitConversionService'
import { I18nService } from './i18n'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ValidationService {
  private t = I18nService.t.bind(I18nService)

  validateUserMetrics(metrics: UserMetrics, isMetric: boolean = true): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Get validation ranges for the current unit system
    const weightRange = UnitConversionService.getWeightRange(isMetric)
    const heightRange = UnitConversionService.getHeightRange(isMetric)
    
    // Convert to metric for BMI and other calculations
    const weightKg = UnitConversionService.convertWeightToMetric(metrics.weight, isMetric)
    const heightCm = UnitConversionService.convertHeightToMetric(metrics.height, isMetric)

    // Basic validation
    if (!metrics.gender || (metrics.gender !== 'male' && metrics.gender !== 'female')) {
      errors.push(this.t('validation.genderRequired'))
    }

    if (!metrics.weight || metrics.weight < weightRange.min || metrics.weight > weightRange.max) {
      const unit = isMetric ? 'kg' : 'lbs'
      errors.push(this.t('validation.weightRange', { 
        min: weightRange.min.toString(), 
        max: weightRange.max.toString(), 
        unit 
      }))
    }

    if (!metrics.height || metrics.height < heightRange.min || metrics.height > heightRange.max) {
      const unit = isMetric ? 'cm' : 'ft'
      errors.push(this.t('validation.heightRange', { 
        min: heightRange.min.toString(), 
        max: heightRange.max.toString(), 
        unit 
      }))
    }

    if (!metrics.age || metrics.age < 16 || metrics.age > 80) {
      errors.push(this.t('validation.ageRange'))
    }

    if (!metrics.activityLevel || !['sedentary', 'lightlyActive', 'moderatelyActive', 'highlyActive'].includes(metrics.activityLevel)) {
      errors.push(this.t('validation.activityRequired'))
    }

    if (!metrics.bodyFatPercentage || metrics.bodyFatPercentage < 8 || metrics.bodyFatPercentage > 35) {
      errors.push(this.t('validation.bodyFatRange'))
    }

    // Gender-specific body fat validation
    if (metrics.gender && metrics.bodyFatPercentage) {
      const minBF = metrics.gender === 'male' ? 10 : 18
      const maxBF = metrics.gender === 'male' ? 20 : 28
      
      if (metrics.bodyFatPercentage < minBF || metrics.bodyFatPercentage > maxBF) {
        warnings.push(this.t('validation.bodyFatGenderRange', {
          min: minBF.toString(),
          max: maxBF.toString(),
          gender: this.t(`form.${metrics.gender}`)
        }))
      }
    }

    // Add business logic warnings
    if (metrics.bodyFatPercentage && metrics.bodyFatPercentage < 8) {
      warnings.push(this.t('validation.bodyFatLowWarning'))
    }

    if (metrics.bodyFatPercentage && metrics.bodyFatPercentage > 30) {
      warnings.push(this.t('validation.bodyFatHighWarning'))
    }

    if (metrics.age && metrics.age > 65) {
      warnings.push(this.t('validation.seniorWarning'))
    }

    // BMI warnings using converted values
    if (weightKg && heightCm) {
      const bmi = weightKg / (heightCm / 100) ** 2
      if (bmi < 18.5) {
        warnings.push(this.t('validation.bmiUnderweight'))
      } else if (bmi > 30) {
        warnings.push(this.t('validation.bmiObese'))
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}