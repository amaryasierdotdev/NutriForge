import { UnitConverter } from './UnitConverter'

export class ProteinCalculator {
  // Updated protein requirements based on research
  private static proteinRanges = {
    bulk: { min: 0.7, max: 1.0 }, // 0.7-1.0 g/lb
    cut: { min: 0.8, max: 1.2 },  // 0.8-1.2 g/lb  
    maintain: { min: 0.7, max: 0.7 } // 0.7 g/lb
  }

  static calculateProtein(
    weightKg: number, 
    goal: 'bulk' | 'cut' | 'maintain',
    bodyFatPercentage: number = 15,
    isMetric: boolean = true
  ): { min: number; max: number; recommended: number } {
    const weightLbs = isMetric ? UnitConverter.kgToLbs(weightKg) : weightKg
    const range = this.proteinRanges[goal]
    
    // Adjust based on body fat percentage
    const leanMassMultiplier = this.getLeanMassMultiplier(bodyFatPercentage)
    const adjustedWeight = weightLbs * leanMassMultiplier
    
    const min = Math.round(adjustedWeight * range.min)
    const max = Math.round(adjustedWeight * range.max)
    const recommended = Math.round(adjustedWeight * ((range.min + range.max) / 2))

    return { min, max, recommended }
  }

  private static getLeanMassMultiplier(bodyFatPercentage: number): number {
    // Higher body fat = lower multiplier (focus on lean mass)
    if (bodyFatPercentage <= 12) return 1.0
    if (bodyFatPercentage <= 18) return 0.95
    if (bodyFatPercentage <= 25) return 0.9
    return 0.85
  }

  static getProteinRecommendation(goal: 'bulk' | 'cut' | 'maintain'): string {
    const range = this.proteinRanges[goal]
    return `${range.min}-${range.max} g/lb`
  }

  static calculateDailyProtein(
    weightKg: number,
    goal: 'bulk' | 'cut' | 'maintain',
    bodyFatPercentage: number = 15,
    isMetric: boolean = true
  ): number {
    const { recommended } = this.calculateProtein(weightKg, goal, bodyFatPercentage, isMetric)
    return recommended
  }
}