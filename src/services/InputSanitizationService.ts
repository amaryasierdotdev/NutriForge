import { EnterpriseConfigService } from './EnterpriseConfig'

export class InputSanitizationService {
  private static instance: InputSanitizationService
  private config = EnterpriseConfigService.getInstance()

  private constructor() {}

  static getInstance(): InputSanitizationService {
    if (!InputSanitizationService.instance) {
      InputSanitizationService.instance = new InputSanitizationService()
    }
    return InputSanitizationService.instance
  }

  // Sanitize text input
  sanitizeText(input: string): string {
    if (!this.config.shouldSanitizeInput()) {
      return input
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, this.config.get('security').maxInputLength)
  }

  // Sanitize numeric input
  sanitizeNumber(input: string | number): number | null {
    const str = String(input).trim()
    
    // Remove non-numeric characters except decimal point and minus
    const cleaned = str.replace(/[^\d.-]/g, '')
    
    const num = parseFloat(cleaned)
    
    if (isNaN(num) || !isFinite(num)) {
      return null
    }
    
    return num
  }

  // Validate and sanitize email
  sanitizeEmail(email: string): string | null {
    if (!this.config.shouldSanitizeInput()) {
      return email
    }

    const sanitized = this.sanitizeText(email).toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    return emailRegex.test(sanitized) ? sanitized : null
  }

  // Sanitize client name
  sanitizeClientName(name: string): string {
    return this.sanitizeText(name)
      .replace(/[^\w\s-]/g, '') // Only allow word characters, spaces, and hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 100) // Limit length
  }

  // Validate numeric ranges
  validateNumericRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max && isFinite(value)
  }

  // Sanitize form data
  sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(formData)) {
      switch (key) {
        case 'name':
          sanitized[key] = this.sanitizeClientName(String(value))
          break
        case 'weight':
        case 'height':
        case 'age':
        case 'bodyFatPercentage':
          sanitized[key] = this.sanitizeNumber(value)
          break
        case 'gender':
          sanitized[key] = ['male', 'female'].includes(String(value)) ? String(value) : ''
          break
        case 'activityLevel':
          const validLevels = ['sedentary', 'lightlyActive', 'moderatelyActive', 'highlyActive']
          sanitized[key] = validLevels.includes(String(value)) ? String(value) : ''
          break
        default:
          sanitized[key] = this.sanitizeText(String(value))
      }
    }

    return sanitized
  }

  // Rate limiting check
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const record = this.rateLimitMap.get(identifier)

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxRequests) {
      return false
    }

    record.count++
    return true
  }

  // Clean up old rate limit records
  cleanupRateLimits(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.rateLimitMap.delete(key))
  }

  // XSS prevention
  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // SQL injection prevention (for future API integration)
  escapeSql(input: string): string {
    return input.replace(/'/g, "''").replace(/;/g, '')
  }

  // Validate file uploads (for future features)
  validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large' }
    }

    return { valid: true }
  }
}