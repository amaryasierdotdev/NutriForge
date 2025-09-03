export class SecurityService {
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  static validateNumber(value: any, min: number, max: number): boolean {
    const num = Number(value)
    return !isNaN(num) && num >= min && num <= max
  }

  static generateCSRFToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  static hashData(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString()
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}