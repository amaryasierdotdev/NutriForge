import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

interface Props {
  currentLanguage: string
  availableLanguages: Language[]
  onLanguageChange: (languageCode: string) => void
  isDarkMode: boolean
  compact?: boolean
}

const SelectorContainer = styled.div`
  position: relative;
  display: inline-block;
`

const SelectorButton = styled.button<{ isDarkMode: boolean; isOpen: boolean; compact?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: ${props => props.compact ? '10px 12px' : '12px 16px'};
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)'
      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.05) 100%)'};
  border: 1px solid ${props =>
    props.isOpen
      ? 'rgba(16, 185, 129, 0.4)'
      : props.isDarkMode
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(15, 23, 42, 0.15)'};
  border-radius: 16px;
  color: ${props => (props.isDarkMode ? '#ffffff' : '#0f172a')};
  font-size: ${props => props.compact ? '12px' : '13px'};
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(16px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props =>
    props.isDarkMode
      ? '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};
  min-width: ${props => props.compact ? '60px' : '150px'};
  justify-content: space-between;

  &:hover {
    border-color: rgba(16, 185, 129, 0.4);
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${props =>
      props.isDarkMode
        ? '0 8px 24px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        : '0 8px 24px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'};
  }

  &:focus {
    outline: none;
    border-color: rgba(16, 185, 129, 0.6);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`

const FlagIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
`

const LanguageText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`

const LanguageName = styled.span`
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
`

const NativeName = styled.span`
  font-size: 11px;
  opacity: 0.7;
  line-height: 1.2;
`

const ChevronIcon = styled.svg<{ isOpen: boolean }>`
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  transform: ${props => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  opacity: 0.7;
`

const DropdownContainer = styled(motion.div)<{ isDarkMode: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.98) 0%, rgba(9, 9, 11, 0.95) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 16px;
  backdrop-filter: blur(24px);
  box-shadow: ${props =>
    props.isDarkMode
      ? '0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      : '0 20px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'};
  overflow: hidden;
  z-index: 1000;
`

const DropdownItem = styled.button<{ isDarkMode: boolean; isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${props =>
    props.isSelected
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
      : 'transparent'};
  border: none;
  color: ${props => (props.isDarkMode ? '#ffffff' : '#0f172a')};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props =>
      props.isDarkMode
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'};
  }

  &:focus {
    outline: none;
    background: ${props =>
      props.isDarkMode
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)'};
  }
`

const CheckIcon = styled.svg`
  width: 16px;
  height: 16px;
  color: #10b981;
  margin-left: auto;
`

export const EnhancedLanguageSelector: React.FC<Props> = ({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  isDarkMode,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // const currentLang = availableLanguages.find(lang => lang.code === currentLanguage)

  // Enhanced language data with modern minimalist icons
  const enhancedLanguages = availableLanguages.map(lang => ({
    ...lang,
    flag: lang.code === 'en' ? '◯' : 
          lang.code === 'ms' ? '◐' : 
          lang.code === 'zh' ? '◑' : 
          lang.code === 'ta' ? '◒' : '◯'
  }))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode)
    setIsOpen(false)
  }

  const currentEnhanced = enhancedLanguages.find(lang => lang.code === currentLanguage)

  return (
    <SelectorContainer ref={containerRef}>
      <SelectorButton
        isDarkMode={isDarkMode}
        isOpen={isOpen}
        compact={compact}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        <FlagIcon>{currentEnhanced?.flag}</FlagIcon>
        {!compact && (
          <LanguageText>
            <LanguageName>{currentEnhanced?.name}</LanguageName>
            <NativeName>{currentEnhanced?.nativeName}</NativeName>
          </LanguageText>
        )}
        <ChevronIcon isOpen={isOpen} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </ChevronIcon>
      </SelectorButton>

      <AnimatePresence>
        {isOpen && (
          <DropdownContainer
            isDarkMode={isDarkMode}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            role="listbox"
          >
            {enhancedLanguages.map((language) => (
              <DropdownItem
                key={language.code}
                isDarkMode={isDarkMode}
                isSelected={language.code === currentLanguage}
                onClick={() => handleLanguageSelect(language.code)}
                role="option"
                aria-selected={language.code === currentLanguage}
              >
                <FlagIcon>{language.flag}</FlagIcon>
                <LanguageText>
                  <LanguageName>{language.name}</LanguageName>
                  <NativeName>{language.nativeName}</NativeName>
                </LanguageText>
                {language.code === currentLanguage && (
                  <CheckIcon viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </CheckIcon>
                )}
              </DropdownItem>
            ))}
          </DropdownContainer>
        )}
      </AnimatePresence>
    </SelectorContainer>
  )
}