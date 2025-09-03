import { useState, useEffect } from 'react'
import { I18nService } from '../services/i18n'

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState(I18nService.getCurrentLanguage())

  useEffect(() => {
    I18nService.init()
    setCurrentLanguage(I18nService.getCurrentLanguage())
  }, [])

  const changeLanguage = (languageCode: string) => {
    I18nService.setLanguage(languageCode)
    setCurrentLanguage(languageCode)
  }

  const t = (key: string, params?: Record<string, string>) => {
    return I18nService.t(key, params)
  }

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages: I18nService.getAvailableLanguages()
  }
}