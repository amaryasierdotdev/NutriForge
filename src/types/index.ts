// Core domain types
export interface UserMetrics {
  gender: 'male' | 'female'
  weight: number
  height: number
  age: number
  bodyFatPercentage: number
  activityLevel: ActivityLevel
}

export type ActivityLevel = 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'highlyActive'

export type Goal = 'bulk' | 'cut' | 'maintain'

export interface NutritionPlan {
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
}

export interface BodyComposition {
  bmr: number
  tdee: number
  leanBodyMass: number
  bmi: number
}

export interface HydrationNeeds {
  baseline: number
  preWorkout: number
  intraWorkout: number
  postWorkout: number
  total: number
}

export interface CalculationResults {
  bodyComposition: BodyComposition
  nutrition: {
    bulk: NutritionPlan
    cut: NutritionPlan
    maintain: NutritionPlan
  }
  hydration: {
    regular: HydrationNeeds
    training: HydrationNeeds
  }
  heartRate: {
    maximum: number
    lissZone: number
  }
}