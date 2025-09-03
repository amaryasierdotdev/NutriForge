import { UserMetrics, Goal, CalculationResults } from '../types'

export class NutritionCalculatorService {
  private readonly ACTIVITY_MULTIPLIERS = {
    sedentary: 1.35,
    lightlyActive: 1.65,
    moderatelyActive: 1.9,
    highlyActive: 2.1
  }

  calculateBMR(metrics: UserMetrics): number {
    const { gender, weight, height, age } = metrics
    const baseBMR = 10 * weight + 6.25 * height - 5 * age
    return gender === 'male' ? baseBMR + 5 : baseBMR - 161
  }

  calculateTDEE(bmr: number, activityLevel: UserMetrics['activityLevel']): number {
    return bmr * this.ACTIVITY_MULTIPLIERS[activityLevel]
  }

  calculateProtein(metrics: UserMetrics, goal: Goal): number {
    const { weight, bodyFatPercentage, gender } = metrics
    
    // Constrain body fat to valid ranges
    const constrainedBF = gender === 'male' 
      ? Math.max(10, Math.min(20, bodyFatPercentage))
      : Math.max(18, Math.min(28, bodyFatPercentage))
    
    // Calculate inverse relationship: lower BF = higher protein
    const bfRange = gender === 'male' ? 10 : 10 // 10% range for both (male: 10-20, female: 18-28)
    const bfMin = gender === 'male' ? 10 : 18
    const bfRatio = (constrainedBF - bfMin) / bfRange // 0 = lowest BF, 1 = highest BF
    
    let proteinMultiplier: number
    
    if (goal === 'cut') {
      // 2.7g/kg at lowest BF, 1.8g/kg at highest BF
      proteinMultiplier = 2.7 - (bfRatio * 0.9)
    } else if (goal === 'bulk') {
      // 2.2g/kg at lowest BF, 1.6g/kg at highest BF
      proteinMultiplier = 2.2 - (bfRatio * 0.6)
    } else {
      // Maintenance: fixed 1.6g/kg
      proteinMultiplier = 1.6
    }
    
    return weight * proteinMultiplier
  }

  calculateFat(calories: number, bodyFatPercentage: number, gender: 'male' | 'female'): number {
    // Constrain body fat to valid ranges and map to 20-30% fat intake
    const constrainedBF = gender === 'male' 
      ? Math.max(10, Math.min(20, bodyFatPercentage))
      : Math.max(18, Math.min(28, bodyFatPercentage))
    
    // Calculate linear interpolation: higher BF = higher fat intake (20-30%)
    const bfRange = gender === 'male' ? 10 : 10 // Male: 10-20%, Female: 18-28%
    const bfMin = gender === 'male' ? 10 : 18
    const bfRatio = (constrainedBF - bfMin) / bfRange // 0 = lowest BF, 1 = highest BF
    
    // Linear interpolation: 20% at lowest BF, 30% at highest BF
    const fatPercentage = 20 + (bfRatio * 10)
    
    return (calories * fatPercentage / 100) / 9
  }

  calculateNutrition(metrics: UserMetrics): CalculationResults {
    const bmr = this.calculateBMR(metrics)
    const tdee = this.calculateTDEE(bmr, metrics.activityLevel)
    const leanBodyMass = metrics.weight * (1 - metrics.bodyFatPercentage / 100)
    const bmi = metrics.weight / (metrics.height / 100) ** 2

    // Fat calculation now uses slider system (20-30%) based on body fat percentage

    return {
      bodyComposition: { bmr, tdee, leanBodyMass, bmi },
      nutrition: {
        bulk: (() => {
          const calories = Math.round(tdee * 1.1)
          const protein = Math.round(this.calculateProtein(metrics, 'bulk'))
          const fat = Math.round(this.calculateFat(calories, metrics.bodyFatPercentage, metrics.gender))
          const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4)
          const fiber = Math.round(Math.min(25 + Math.floor(carbs / 50) * 5, 75))
          return { calories, protein, fat, carbs, fiber }
        })(),
        cut: (() => {
          const calories = Math.round(tdee * 0.9)
          const protein = Math.round(this.calculateProtein(metrics, 'cut'))
          const fat = Math.round(this.calculateFat(calories, metrics.bodyFatPercentage, metrics.gender))
          const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4)
          const fiber = Math.round(Math.min(25 + Math.floor(carbs / 50) * 5, 75))
          return { calories, protein, fat, carbs, fiber }
        })(),
        maintain: (() => {
          const calories = Math.round(tdee)
          const protein = Math.round(this.calculateProtein(metrics, 'maintain'))
          const fat = Math.round(this.calculateFat(calories, metrics.bodyFatPercentage, metrics.gender))
          const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4)
          const fiber = Math.round(Math.min(25 + Math.floor(carbs / 50) * 5, 75))
          return { calories, protein, fat, carbs, fiber }
        })()
      },
      hydration: {
        regular: {
          baseline: tdee / 1000,
          preWorkout: 0,
          intraWorkout: 0,
          postWorkout: 0,
          total: tdee / 1000
        },
        training: {
          baseline: tdee / 1000,
          preWorkout: (5 * metrics.weight) / 1000,
          intraWorkout: 0.4,
          postWorkout: 1.25,
          total: tdee / 1000 + (5 * metrics.weight) / 1000 + 1.65
        }
      },
      heartRate: {
        maximum: 220 - metrics.age,
        lissZone: (220 - metrics.age) * 0.6
      }
    }
  }
}