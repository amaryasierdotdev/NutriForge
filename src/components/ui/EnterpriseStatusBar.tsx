import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useEnterpriseFeatures } from '../../hooks/useEnterpriseFeatures'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  isDarkMode: boolean
}

const StatusContainer = styled.div<{ isDarkMode: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(90deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)'
      : 'linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)'};
  border-top: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  z-index: 1000;
  transition: all 0.3s ease;
`

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const StatusItem = styled.div<{ status?: 'healthy' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => 
      props.status === 'healthy' ? '#10b981' :
      props.status === 'warning' ? '#f59e0b' :
      props.status === 'error' ? '#ef4444' : '#6b7280'};
    box-shadow: 0 0 4px ${props => 
      props.status === 'healthy' ? 'rgba(16, 185, 129, 0.4)' :
      props.status === 'warning' ? 'rgba(245, 158, 11, 0.4)' :
      props.status === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'transparent'};
  }
`

const VersionInfo = styled.div`
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 10px;
  opacity: 0.7;
`

export const EnterpriseStatusBar: React.FC<Props> = ({ isDarkMode }) => {
  const { features, analytics, performHealthCheck } = useEnterpriseFeatures()
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'error'>('healthy')
  const [uptime, setUptime] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    const startTime = Date.now()
    
    const updateUptime = () => {
      setUptime(Math.floor((Date.now() - startTime) / 1000))
    }

    const healthCheck = async () => {
      try {
        const health = await performHealthCheck()
        setSystemHealth(health.status === 'healthy' ? 'healthy' : 'error')
      } catch {
        setSystemHealth('error')
      }
    }

    const uptimeInterval = setInterval(updateUptime, 1000)
    const healthInterval = setInterval(healthCheck, 30000)
    
    healthCheck()
    updateUptime()

    return () => {
      clearInterval(uptimeInterval)
      clearInterval(healthInterval)
    }
  }, [performHealthCheck])

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Only show in development or when advanced mode is enabled
  if (process.env.NODE_ENV === 'production' && !features.isAdvancedMode) {
    return null
  }

  return (
    <StatusContainer isDarkMode={isDarkMode}>
      <StatusSection>
        <StatusItem status={systemHealth}>
          {t('commandCenter.system')}
        </StatusItem>
        <StatusItem status={features.hasAnalytics ? 'healthy' : 'warning'}>
          {t('commandCenter.analytics')}
        </StatusItem>
        <StatusItem status={features.isSecure ? 'healthy' : 'warning'}>
          {t('commandCenter.security')}
        </StatusItem>
        <StatusItem>
          {t('commandCenter.mode')}: {features.performanceMode}
        </StatusItem>
      </StatusSection>
      
      <StatusSection>
        <div>{t('commandCenter.uptime')}: {formatUptime(uptime)}</div>
        <div>{t('commandCenter.session')}: {analytics.getAnalyticsSummary().sessionId.split('_')[2]}</div>
        <VersionInfo>{t('commandCenter.nutriForgePro')}</VersionInfo>
      </StatusSection>
    </StatusContainer>
  )
}