export const ACTIVITY_LEVELS = {
  SEDENTARY: 'sedentary',
  LIGHTLY_ACTIVE: 'lightlyActive',
  MODERATELY_ACTIVE: 'moderatelyActive',
  HIGHLY_ACTIVE: 'highlyActive'
} as const

export const EXPORT_FORMATS = ['JSON', 'CSV', 'XML', 'TXT'] as const

export const VALIDATION_RULES = {
  AGE: { MIN: 16, MAX: 80 },
  WEIGHT: { MIN: 30, MAX: 300 },
  HEIGHT: { MIN: 120, MAX: 250 },
  BODY_FAT: {
    MALE: { MIN: 10, MAX: 20 },
    FEMALE: { MIN: 18, MAX: 28 }
  }
} as const

export const BMI_CATEGORIES = {
  UNDERWEIGHT: 18.5,
  NORMAL: 25,
  OVERWEIGHT: 30
} as const

export const CAFFEINE_INTAKE = {
  TRAINING_DAY: 250, // mg
  REST_DAY: 150      // mg
} as const