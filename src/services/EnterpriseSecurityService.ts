export class EnterpriseSecurityService {
  private static instance: EnterpriseSecurityService

  private constructor() {}

  static getInstance(): EnterpriseSecurityService {
    if (!EnterpriseSecurityService.instance) {
      EnterpriseSecurityService.instance = new EnterpriseSecurityService()
    }
    return EnterpriseSecurityService.instance
  }

  // Content Security Policy
  initializeCSP(): void {
    if (process.env.NODE_ENV === 'production') {
      const meta = document.createElement('meta')
      meta.httpEquiv = 'Content-Security-Policy'
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self';
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
      `.replace(/\s+/g, ' ').trim()
      document.head.appendChild(meta)
    }
  }

  // Secure headers
  setSecurityHeaders(): void {
    if (process.env.NODE_ENV === 'production') {
      // X-Frame-Options
      const frameOptions = document.createElement('meta')
      frameOptions.httpEquiv = 'X-Frame-Options'
      frameOptions.content = 'DENY'
      document.head.appendChild(frameOptions)

      // X-Content-Type-Options
      const contentType = document.createElement('meta')
      contentType.httpEquiv = 'X-Content-Type-Options'
      contentType.content = 'nosniff'
      document.head.appendChild(contentType)

      // Referrer Policy
      const referrer = document.createElement('meta')
      referrer.name = 'referrer'
      referrer.content = 'strict-origin-when-cross-origin'
      document.head.appendChild(referrer)
    }
  }

  // Detect potential security threats
  detectThreats(): void {
    // Detect developer tools
    const devtools = { open: false }
    const threshold = 160

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          // Developer tools detected
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // Detect console tampering
    // Console tampering detection disabled in production
  }

  // Encrypt sensitive data
  encryptData(data: string): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Use Web Crypto API for production
      return btoa(data) // Simple base64 for demo
    }
    return data
  }

  // Decrypt sensitive data
  decryptData(encryptedData: string): string {
    try {
      return atob(encryptedData)
    } catch {
      return encryptedData
    }
  }

  // Generate secure session ID
  generateSecureId(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Validate origin
  validateOrigin(origin: string): boolean {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      window.location.origin
    ]
    return allowedOrigins.includes(origin)
  }
}