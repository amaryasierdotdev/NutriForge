interface ThemeColors {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  accent: string
}

export class ThemeManager {
  private static darkTheme: ThemeColors = {
    primary: '#10b981',
    secondary: '#3b82f6',
    background: '#0a0a0a',
    surface: 'rgba(15, 15, 15, 0.95)',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    border: 'rgba(255, 255, 255, 0.12)',
    accent: '#8b5cf6'
  }

  private static lightTheme: ThemeColors = {
    primary: '#10b981',
    secondary: '#3b82f6',
    background: '#ffffff',
    surface: 'rgba(255, 255, 255, 0.98)',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: 'rgba(0, 0, 0, 0.08)',
    accent: '#8b5cf6'
  }

  static getTheme(isDarkMode: boolean): ThemeColors {
    return isDarkMode ? this.darkTheme : this.lightTheme
  }

  static getGradient(type: 'primary' | 'secondary' | 'accent'): string {
    switch (type) {
      case 'primary':
        return 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
      case 'secondary':
        return 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
      case 'accent':
        return 'linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)'
      default:
        return 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
    }
  }

  static getTextGradient(): string {
    return 'linear-gradient(135deg, #ffffff 0%, #10b981 30%, #3b82f6 70%, #8b5cf6 100%)'
  }

  static applyTheme(isDarkMode: boolean): void {
    const theme = this.getTheme(isDarkMode)
    const root = document.documentElement
    
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    root.style.setProperty('--gradient-primary', this.getGradient('primary'))
    root.style.setProperty('--gradient-text', this.getTextGradient())
  }
}