export interface ValidationRule<T> {
  field: keyof T
  validator: (value: any) => boolean
  message: string
}

export class DataValidator<T> {
  private rules: ValidationRule<T>[] = []

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule)
    return this
  }

  validate(data: T): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const rule of this.rules) {
      const value = data[rule.field]
      if (!rule.validator(value)) {
        errors.push(rule.message)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static required(value: any): boolean {
    return value !== null && value !== undefined && value !== ''
  }

  static numeric(value: any): boolean {
    return !isNaN(Number(value)) && isFinite(Number(value))
  }

  static range(min: number, max: number) {
    return (value: any): boolean => {
      const num = Number(value)
      return num >= min && num <= max
    }
  }

  static email(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
}