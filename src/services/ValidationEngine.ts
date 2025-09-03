interface ValidationRule {
  field: string
  type: 'required' | 'number' | 'range' | 'email' | 'custom'
  min?: number
  max?: number
  message: string
  validator?: (value: any) => boolean
}

export class ValidationEngine {
  private rules: ValidationRule[] = []

  addRule(rule: ValidationRule): this {
    this.rules.push(rule)
    return this
  }

  validate(data: Record<string, any>): { isValid: boolean; errors: string[]; fieldErrors: Record<string, string> } {
    const errors: string[] = []
    const fieldErrors: Record<string, string> = {}

    for (const rule of this.rules) {
      const value = data[rule.field]
      let isValid = true

      switch (rule.type) {
        case 'required':
          isValid = value !== null && value !== undefined && value !== ''
          break
        case 'number':
          isValid = !isNaN(Number(value)) && isFinite(Number(value))
          break
        case 'range':
          const num = Number(value)
          isValid = !isNaN(num) && 
                   (rule.min === undefined || num >= rule.min) && 
                   (rule.max === undefined || num <= rule.max)
          break
        case 'email':
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
          break
        case 'custom':
          isValid = rule.validator ? rule.validator(value) : true
          break
      }

      if (!isValid) {
        errors.push(rule.message)
        fieldErrors[rule.field] = rule.message
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    }
  }

  static createBodyFatValidator(gender: string): ValidationEngine {
    const engine = new ValidationEngine()
    const isGenderMale = gender === 'male'
    
    return engine.addRule({
      field: 'bodyFatPercentage',
      type: 'range',
      min: isGenderMale ? 10 : 18,
      max: isGenderMale ? 20 : 28,
      message: `Body fat percentage must be between ${isGenderMale ? '10-20' : '18-28'}% for ${gender}s`
    })
  }
}