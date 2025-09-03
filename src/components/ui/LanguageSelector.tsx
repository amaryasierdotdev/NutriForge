import React from 'react'
import styled from 'styled-components'

const SelectorContainer = styled.div<{ isDarkMode: boolean }>`
  position: relative;
  display: inline-block;
`

const Select = styled.select<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.05) 100%)'};
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.15)'};
  border-radius: 12px;
  padding: 10px 32px 10px 16px;
  color: ${props => props.isDarkMode ? '#ffffff' : '#0f172a'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(12px);
  outline: none;
  appearance: none;
  min-width: 140px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(16, 185, 129, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  }
  
  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`

const Arrow = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid ${props => props.isDarkMode ? '#9ca3af' : '#64748b'};
  pointer-events: none;
`

interface LanguageSelectorProps {
  currentLanguage: string
  availableLanguages: Array<{ code: string; nativeName: string }>
  onLanguageChange: (language: string) => void
  isDarkMode: boolean
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  isDarkMode
}) => {
  return (
    <SelectorContainer isDarkMode={isDarkMode}>
      <Select
        value={currentLanguage}
        onChange={e => onLanguageChange(e.target.value)}
        isDarkMode={isDarkMode}
      >
        {availableLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </Select>
      <Arrow isDarkMode={isDarkMode} />
    </SelectorContainer>
  )
}