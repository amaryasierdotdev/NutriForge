import { NutritionCalculatorService } from '../../services/NutritionCalculatorService'
import { UserMetrics } from '../../types'

describe('NutritionCalculatorService', () => {
  let service: NutritionCalculatorService
  const mockMetrics: UserMetrics = {
    gender: 'male',
    weight: 80,
    height: 180,
    age: 30,
    bodyFatPercentage: 15,
    activityLevel: 'moderatelyActive'
  }

  beforeEach(() => {
    service = new NutritionCalculatorService()
  })

  describe('calculateBMR', () => {
    it('calculates BMR correctly for males', () => {
      const bmr = service.calculateBMR(mockMetrics)
      expect(bmr).toBe(1780)
    })

    it('calculates BMR correctly for females', () => {
      const femaleMetrics = { ...mockMetrics, gender: 'female' as const }
      const bmr = service.calculateBMR(femaleMetrics)
      expect(bmr).toBe(1614)
    })
  })

  describe('calculateTDEE', () => {
    it('applies correct activity multiplier', () => {
      const bmr = 1780
      const tdee = service.calculateTDEE(bmr, 'moderatelyActive')
      expect(tdee).toBeCloseTo(3382, 0)
    })
  })

  describe('calculateNutrition', () => {
    it('returns complete calculation results', () => {
      const results = service.calculateNutrition(mockMetrics)
      
      expect(results.bodyComposition.bmr).toBe(1780)
      expect(results.bodyComposition.bmi).toBeCloseTo(24.7, 1)
      expect(results.nutrition.bulk.calories).toBeGreaterThan(results.nutrition.maintain.calories)
      expect(results.nutrition.cut.calories).toBeLessThan(results.nutrition.maintain.calories)
    })
  })
})