interface FormField {
  name: string
  value: any
  validation?: (value: any) => boolean
  sanitization?: (value: any) => any
}

export class FormManager {
  private fields: Map<string, FormField> = new Map()
  private listeners: Set<(fields: Map<string, FormField>) => void> = new Set()

  addField(field: FormField): void {
    this.fields.set(field.name, field)
    this.notifyListeners()
  }

  updateField(name: string, value: any): void {
    const field = this.fields.get(name)
    if (field) {
      let processedValue = value
      
      if (field.sanitization) {
        processedValue = field.sanitization(value)
      }
      
      field.value = processedValue
      this.fields.set(name, field)
      this.notifyListeners()
    }
  }

  getField(name: string): FormField | undefined {
    return this.fields.get(name)
  }

  getAllFields(): Record<string, any> {
    const result: Record<string, any> = {}
    this.fields.forEach((field, name) => {
      result[name] = field.value
    })
    return result
  }

  validateAll(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    this.fields.forEach((field, name) => {
      if (field.validation && !field.validation(field.value)) {
        errors.push(`Invalid value for ${name}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  subscribe(listener: (fields: Map<string, FormField>) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.fields))
  }

  reset(): void {
    this.fields.clear()
    this.notifyListeners()
  }
}