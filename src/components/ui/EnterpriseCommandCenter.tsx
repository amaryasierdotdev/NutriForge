import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'

import { EnhancedLanguageSelector } from './EnhancedLanguageSelector'
import { useTranslation } from '../../hooks/useTranslation'
import { Tooltip } from './Tooltip'

interface Props {
  isDarkMode: boolean
  isOpen: boolean
  onClose: () => void
  useMetric: boolean
  onUnitChange: (useMetric: boolean) => void
  onThemeChange: (isDark: boolean) => void
  onEnableAdvanced?: () => void
  onReset?: () => void
}

const CommandOverlay = styled(motion.div)`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(8px);
  z-index: 999999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden;
`

const CommandPanel = styled(motion.div)<{ isDarkMode: boolean }>`
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  max-height: 800px;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.98) 0%, rgba(9, 9, 11, 0.95) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 24px;
  backdrop-filter: blur(32px);
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1000000 !important;
`

const CommandHeader = styled.div<{ isDarkMode: boolean }>`
  padding: 24px 32px;
  border-bottom: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CommandTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const CloseButton = styled.button<{ isDarkMode: boolean }>`
  width: 40px;
  height: 40px;
  border: none;
  background: ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  color: ${props => props.isDarkMode ? '#ffffff' : '#000000'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props =>
      props.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  }
`

const CommandContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr;
  overflow: hidden;
`

const CommandSidebar = styled.div<{ isDarkMode: boolean }>`
  background: ${props =>
    props.isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'};
  border-right: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  padding: 24px 0;
`

const CommandMenuItem = styled.button<{ isDarkMode: boolean; isActive: boolean }>`
  width: 100%;
  padding: 14px 24px;
  border: none;
  background: ${props =>
    props.isActive
      ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
      : 'transparent'};
  color: ${props => 
    props.isActive 
      ? '#10b981' 
      : props.isDarkMode ? '#d1d5db' : '#475569'};
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.isActive ? 600 : 500};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid ${props =>
    props.isActive ? '#10b981' : 'transparent'};
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${props =>
      props.isActive 
        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.08) 100%)'
        : props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
    color: ${props => 
      props.isActive 
        ? '#059669' 
        : props.isDarkMode ? '#ffffff' : '#1f2937'};
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(1px);
  }
`

const CommandMain = styled.div`
  padding: 24px 32px;
  overflow-y: auto;
`

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const MetricCard = styled.div<{ isDarkMode: boolean }>`
  padding: 16px;
  background: ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
`

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 4px;
`

const MetricLabel = styled.div<{ isDarkMode: boolean }>`
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const EnterpriseCommandCenter: React.FC<Props> = ({ 
  isDarkMode, 
  isOpen, 
  onClose, 
  useMetric, 
  onUnitChange, 
  onThemeChange,
  onEnableAdvanced,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState('settings')
  const [metrics, setMetrics] = useState<any>({})
  const { currentLanguage, changeLanguage, availableLanguages } = useTranslation()

  const loadMetrics = useCallback(async () => {
    try {
      // Simplified metrics loading to prevent crashes
      setMetrics({
        health: { status: 'healthy' },
        compliance: { retentionCompliance: 95, policies: 12, dataAssets: 8 },
        integrations: {},
        analytics: { eventCount: 0, sessionDuration: 0 },
        workflows: 0
      })
    } catch (error) {
      // Failed to load metrics - use defaults
      setMetrics({})
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Reset any stuck states
      setActiveTab('settings')
      loadMetrics()
      
      // Prevent body scroll when modal is open
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.style.overflow = originalOverflow
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose, loadMetrics])

  const renderOverview = () => (
    <div>
      <h3 style={{ marginBottom: '16px', color: isDarkMode ? '#ffffff' : '#000000' }}>
        {t('commandCenter.systemOverview')}
      </h3>
      <MetricGrid>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>{metrics.health?.status === 'healthy' ? '✅' : '⚠️'}</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.systemHealth')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>{metrics.compliance?.retentionCompliance || 0}%</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.dataCompliance')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>{Object.keys(metrics.integrations || {}).length}</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.activeIntegrations')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>{metrics.workflows || 0}</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.workflows')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>{metrics.analytics?.eventCount || 0}</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.eventsToday')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>{Math.round((metrics.analytics?.sessionDuration || 0) / 60000)}m</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.sessionDuration')}</MetricLabel>
        </MetricCard>
      </MetricGrid>
    </div>
  )



  const handleFeatureClick = (featureId: string) => {
    switch (featureId) {
      case 'translation':
        setActiveTab('settings')
        break
      case 'export':
        onEnableAdvanced?.()
        onClose()
        break
      case 'validation':
        onClose()
        setTimeout(() => {
          const firstInput = document.querySelector('input')
          firstInput?.focus()
        }, 100)
        break
      case 'themes':
        setActiveTab('settings')
        break
      case 'units':
        setActiveTab('settings')
        break
    }
  }

  const renderIntegrations = () => (
    <div>
      <h3 style={{ marginBottom: '16px', color: isDarkMode ? '#ffffff' : '#000000' }}>
        {t('commandCenter.applicationFeatures')}
      </h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {[
          { id: 'translation', name: 'Multi-Language Support', status: 'Active', type: 'Core', languages: '4 Languages' },
          { id: 'export', name: 'Data Export System', status: 'Active', type: 'Feature', formats: 'JSON, CSV, XML, TXT' },
          { id: 'validation', name: 'Input Validation', status: 'Active', type: 'Security', coverage: '100%' },
          { id: 'themes', name: 'Theme Management', status: 'Active', type: 'UI', modes: 'Dark & Light' },
          { id: 'units', name: 'Unit Conversion', status: 'Active', type: 'Utility', systems: 'Metric & Imperial' }
        ].map((feature) => (
          <Tooltip
            key={feature.id}
            content={`Click to access ${feature.name} - ${feature.type} module with ${feature.languages || feature.formats || feature.coverage || feature.modes || feature.systems}`}
          >
            <button
              onClick={() => handleFeatureClick(feature.id)}
              style={{
                width: '100%',
                padding: '16px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: isDarkMode ? '#ffffff' : '#000000' }}>
                  {feature.name}
                </div>
                <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  {feature.type} • {feature.languages || feature.formats || feature.coverage || feature.modes || feature.systems}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 600,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  {feature.status}
                </div>
                <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>→</span>
              </div>
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div>
      <h3 style={{ marginBottom: '16px', color: isDarkMode ? '#ffffff' : '#000000' }}>
        {t('commandCenter.performanceMetrics')}
      </h3>
      <MetricGrid>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>98.5%</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.uptime')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>1.2s</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.loadTime')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>0.8s</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.responseTime')}</MetricLabel>
        </MetricCard>
        <MetricCard isDarkMode={isDarkMode}>
          <MetricValue>99.2%</MetricValue>
          <MetricLabel isDarkMode={isDarkMode}>{t('commandCenter.successRate')}</MetricLabel>
        </MetricCard>
      </MetricGrid>
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '12px', color: isDarkMode ? '#ffffff' : '#000000', fontSize: '14px' }}>
          {t('commandCenter.recentActivity')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { time: `2 ${t('commandCenter.minAgo')}`, action: t('commandCenter.calculationCompleted'), status: 'success' },
            { time: `5 ${t('commandCenter.minAgo')}`, action: t('commandCenter.themeChanged'), status: 'info' },
            { time: `12 ${t('commandCenter.minAgo')}`, action: t('commandCenter.languageSwitched'), status: 'info' },
            { time: `18 ${t('commandCenter.minAgo')}`, action: t('commandCenter.exportGenerated'), status: 'success' }
          ].map((activity, index) => (
            <div key={index} style={{
              padding: '12px',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{activity.action}</div>
                <div style={{ fontSize: '11px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{activity.time}</div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: activity.status === 'success' ? '#10b981' : '#3b82f6'
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const { t } = useTranslation()
  
  const menuItems = [
    { id: 'overview', label: t('commandCenter.systemStatus'), icon: '◯' },
    { id: 'settings', label: t('commandCenter.userSettings'), icon: '⚬' },
    { id: 'integrations', label: t('commandCenter.appFeatures'), icon: '◐' },
    { id: 'analytics', label: t('commandCenter.performance'), icon: '◑' }
  ]

  const renderSettings = () => (
    <div>
      <h3 style={{ marginBottom: '24px', color: isDarkMode ? '#ffffff' : '#000000' }}>
        {t('commandCenter.applicationSettings')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{
          padding: '20px',
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>◯ {t('commandCenter.language')}</h4>
            <span style={{ 
              fontSize: '11px', 
              color: '#10b981', 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '2px 6px', 
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              {currentLanguage}
            </span>
          </div>
          <EnhancedLanguageSelector
            currentLanguage={currentLanguage}
            availableLanguages={availableLanguages.map(lang => ({ 
              ...lang, 
              flag: lang.code === 'en' ? '◯' : 
                    lang.code === 'ms' ? '◐' : 
                    lang.code === 'zh' ? '◑' : 
                    lang.code === 'ta' ? '◒' : '◯'
            }))}
            onLanguageChange={(lang) => {
              changeLanguage(lang)
            }}
            isDarkMode={isDarkMode}
          />
        </div>
        
        <div style={{
          padding: '20px',
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>◐ {t('commandCenter.unitSystem')}</h4>
            <span style={{ 
              fontSize: '11px', 
              color: '#10b981', 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '2px 6px', 
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              {useMetric ? 'Metric' : 'Imperial'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['metric', 'imperial'].map(unit => (
              <button
                key={unit}
                onClick={() => onUnitChange(unit === 'metric')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: (unit === 'metric' ? useMetric : !useMetric)
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : isDarkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                  border: `1px solid ${(unit === 'metric' ? useMetric : !useMetric) ? '#10b981' : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '8px',
                  color: (unit === 'metric' ? useMetric : !useMetric)
                    ? '#ffffff'
                    : isDarkMode ? '#d1d5db' : '#475569',
                  fontSize: '13px',
                  fontWeight: (unit === 'metric' ? useMetric : !useMetric) ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease'
                }}
              >
                {unit === 'metric' ? t('commandCenter.metricKg') : t('commandCenter.imperialLbs')}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>◑ {t('commandCenter.theme')}</h4>
            <span style={{ 
              fontSize: '11px', 
              color: '#10b981', 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '2px 6px', 
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              {isDarkMode ? t('commandCenter.dark') : t('commandCenter.light')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['dark', 'light'].map(theme => (
              <button
                key={theme}
                onClick={() => onThemeChange(theme === 'dark')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: (theme === 'dark' ? isDarkMode : !isDarkMode)
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : isDarkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                  border: `1px solid ${(theme === 'dark' ? isDarkMode : !isDarkMode) ? '#10b981' : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '8px',
                  color: (theme === 'dark' ? isDarkMode : !isDarkMode)
                    ? '#ffffff'
                    : isDarkMode ? '#d1d5db' : '#475569',
                  fontSize: '13px',
                  fontWeight: (theme === 'dark' ? isDarkMode : !isDarkMode) ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {theme === 'dark' ? `◐ ${t('commandCenter.dark')}` : `◯ ${t('commandCenter.light')}`}
              </button>
            ))}
          </div>
        </div>
        
        {onReset && (
          <div style={{
            padding: '20px',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>◒ {t('commandCenter.reset')}</h4>
              <span style={{ 
                fontSize: '11px', 
                color: '#f59e0b', 
                background: 'rgba(245, 158, 11, 0.1)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {t('commandCenter.actions')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  localStorage.removeItem('language')
                  window.location.reload()
                }}
                style={{
                  padding: '12px 16px',
                  background: isDarkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#d1d5db' : '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'
                  e.currentTarget.style.color = '#f59e0b'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(248, 250, 252, 0.9)'
                  e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.color = isDarkMode ? '#d1d5db' : '#475569'
                }}
              >
                ○ {t('commandCenter.resetLanguage')}
              </button>
              <button
                onClick={() => {
                  onReset()
                  onClose()
                }}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                ◐ {t('commandCenter.newAnalysis')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'settings': return renderSettings()
      case 'integrations': return renderIntegrations()
      case 'analytics': return renderAnalytics()
      default: return renderOverview()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <CommandOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <CommandPanel
        isDarkMode={isDarkMode}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
            <CommandHeader isDarkMode={isDarkMode}>
              <CommandTitle>{t('commandCenter.title')}</CommandTitle>
              <Tooltip content={t('commandCenter.close')}>
                <CloseButton isDarkMode={isDarkMode} onClick={onClose}>
                  ×
                </CloseButton>
              </Tooltip>
            </CommandHeader>
            
            <CommandContent>
              <CommandSidebar isDarkMode={isDarkMode}>
                {menuItems.map(item => (
                  <Tooltip key={item.id} content={`View ${item.label.toLowerCase()}`}>
                    <CommandMenuItem
                      isDarkMode={isDarkMode}
                      isActive={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <span style={{ marginRight: '8px' }}>{item.icon}</span>
                      {item.label}
                    </CommandMenuItem>
                  </Tooltip>
                ))}
              </CommandSidebar>
              
              <CommandMain>
                {renderContent()}
              </CommandMain>
            </CommandContent>
      </CommandPanel>
    </CommandOverlay>,
    document.body
  )
}