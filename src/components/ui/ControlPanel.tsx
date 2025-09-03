import React from 'react'
import styled from 'styled-components'
import { EnhancedLanguageSelector } from './EnhancedLanguageSelector'
import { Tooltip } from './Tooltip'

interface Props {
  isDarkMode: boolean
  useMetric: boolean
  currentLanguage: string
  availableLanguages: Array<{ code: string; name: string; nativeName: string; flag: string }>
  onThemeToggle: () => void
  onUnitToggle: () => void
  onLanguageChange: (lang: string) => void
  t: (key: string) => string
}

const ControlContainer = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 16px;
  backdrop-filter: blur(24px);
  box-shadow: ${props =>
    props.isDarkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.isDarkMode
        ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 12px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'};
  }
`

const ControlButton = styled.button<{ isDarkMode: boolean; isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  background: ${props =>
    props.isActive
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : props.isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid ${props =>
    props.isActive
      ? '#10b981'
      : props.isDarkMode
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  color: ${props =>
    props.isActive
      ? '#ffffff'
      : props.isDarkMode
        ? '#ffffff'
        : '#0f172a'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  min-width: 44px;
  height: 44px;

  &:hover {
    transform: translateY(-1px) scale(1.05);
    border-color: ${props =>
      props.isActive ? '#10b981' : 'rgba(16, 185, 129, 0.4)'};
    box-shadow: ${props =>
      props.isActive
        ? '0 8px 24px rgba(16, 185, 129, 0.3)'
        : '0 4px 16px rgba(16, 185, 129, 0.15)'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const UnitButton = styled(ControlButton)`
  font-size: 12px;
  font-weight: 600;
  min-width: 60px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Divider = styled.div<{ isDarkMode: boolean }>`
  width: 1px;
  height: 32px;
  background: ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  margin: 0 4px;
`

export const ControlPanel: React.FC<Props> = ({
  isDarkMode,
  useMetric,
  currentLanguage,
  availableLanguages,
  onThemeToggle,
  onUnitToggle,
  onLanguageChange,
  t
}) => {
  return (
    <ControlContainer isDarkMode={isDarkMode}>
      <EnhancedLanguageSelector
        currentLanguage={currentLanguage}
        availableLanguages={availableLanguages}
        onLanguageChange={onLanguageChange}
        isDarkMode={isDarkMode}
        compact
      />
      
      <Divider isDarkMode={isDarkMode} />
      
      <Tooltip content={`${t('ui.switchTo')} ${useMetric ? t('ui.imperial') : t('ui.metric')}`}>
        <UnitButton
          isDarkMode={isDarkMode}
          onClick={onUnitToggle}
        >
          {useMetric ? t('ui.metric') : t('ui.imperial')}
        </UnitButton>
      </Tooltip>
      
      <Divider isDarkMode={isDarkMode} />
      
      <Tooltip content={`${t('ui.switchTo')} ${isDarkMode ? t('ui.lightMode') : t('ui.darkMode')} ${t('ui.mode')}`}>
        <ControlButton
          isDarkMode={isDarkMode}
          onClick={onThemeToggle}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {isDarkMode ? (
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>
            ) : (
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" stroke="none"/>
            )}
          </svg>
        </ControlButton>
      </Tooltip>
    </ControlContainer>
  )
}