interface LocaleConfig {
  code: string
  name: string
  dateFormat: string
  numberFormat: Intl.NumberFormatOptions
  currency: string
  rtl: boolean
}

export class LocalizationManager {
  private static locales: Record<string, LocaleConfig> = {
    en: {
      code: 'en',
      name: 'English',
      dateFormat: 'MM/dd/yyyy',
      numberFormat: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      currency: 'USD',
      rtl: false
    },
    ms: {
      code: 'ms',
      name: 'Bahasa Malaysia',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      currency: 'MYR',
      rtl: false
    }
  }

  static formatNumber(value: number, locale: string = 'en'): string {
    const config = this.locales[locale]
    return new Intl.NumberFormat(locale, config.numberFormat).format(value)
  }

  static formatDate(date: Date, locale: string = 'en'): string {
    return new Intl.DateTimeFormat(locale).format(date)
  }

  static formatCurrency(value: number, locale: string = 'en'): string {
    const config = this.locales[locale]
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.currency
    }).format(value)
  }

  static getLocaleConfig(locale: string): LocaleConfig | undefined {
    return this.locales[locale]
  }

  static isRTL(locale: string): boolean {
    return this.locales[locale]?.rtl || false
  }

  static getAvailableLocales(): LocaleConfig[] {
    return Object.values(this.locales)
  }
}