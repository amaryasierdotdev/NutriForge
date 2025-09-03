export class InputValidator {
  static sanitizeNumber(value: string, min?: number, max?: number): number | null {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''))
    
    if (isNaN(num)) return null
    
    if (min !== undefined && num < min) return min
    if (max !== undefined && num > max) return max
    
    return num
  }

  static validateRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  }

  static formatNumber(value: number, decimals: number = 1): string {
    return value.toFixed(decimals)
  }

  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  static isValidPhone(phone: string): boolean {
    return /^\+?[\d\s-()]{10,}$/.test(phone)
  }

  static sanitizeText(text: string): string {
    return text.replace(/[<>]/g, '').trim()
  }
}