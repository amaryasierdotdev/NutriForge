import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { EnterpriseHealthService, SystemHealth } from '../../services/EnterpriseHealthService'
import { EnterpriseCacheService } from '../../services/EnterpriseCacheService'
import { EnterpriseAuditService } from '../../services/EnterpriseAuditService'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  isDarkMode: boolean
}

const DebugContainer = styled.div<{ isDarkMode: boolean; isOpen: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: ${props => props.isOpen ? '400px' : '60px'};
  height: ${props => props.isOpen ? 'auto' : '60px'};
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 12px;
  backdrop-filter: blur(24px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  transition: all 0.3s ease;
  overflow: hidden;
`

const ToggleButton = styled.button<{ isDarkMode: boolean }>`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: ${props => props.isDarkMode ? '#10b981' : '#059669'};
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  
  &:hover {
    background: rgba(16, 185, 129, 0.1);
  }
`

const DebugContent = styled.div`
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
`

const Section = styled.div`
  margin-bottom: 20px;
`

const SectionTitle = styled.h4<{ isDarkMode: boolean }>`
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#10b981' : '#059669'};
`

const StatusIndicator = styled.div<{ status: 'healthy' | 'warning' | 'critical' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  background: ${props => 
    props.status === 'healthy' ? '#10b981' :
    props.status === 'warning' ? '#f59e0b' : '#ef4444'};
`

const MetricRow = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#d1d5db' : '#374151'};
`

const ActionButton = styled.button<{ isDarkMode: boolean }>`
  padding: 6px 12px;
  margin: 2px;
  font-size: 11px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: rgba(16, 185, 129, 0.2);
  }
`

export const EnterpriseDebugPanel: React.FC<Props> = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const { t } = useTranslation()

  const healthService = EnterpriseHealthService.getInstance()
  const cacheService = EnterpriseCacheService.getInstance()
  const auditService = EnterpriseAuditService.getInstance()

  const updateStats = useCallback(async () => {
    try {
      const healthData = await healthService.performHealthCheck()
      const cacheData = cacheService.getStats()
      setHealth(healthData)
      setCacheStats(cacheData)
    } catch (error) {
      console.error('Failed to update debug stats:', error)
    }
  }, [healthService, cacheService])

  useEffect(() => {
    if (isOpen) {
      updateStats()
      const interval = setInterval(updateStats, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen, updateStats])

  const clearCache = () => {
    cacheService.clear()
    updateStats()
  }

  const exportHealth = async () => {
    const report = await healthService.exportHealthReport()
    const blob = new Blob([report], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `health-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAudit = () => {
    const report = auditService.exportAuditLog()
    const blob = new Blob([report], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <DebugContainer isDarkMode={isDarkMode} isOpen={isOpen}>
      <ToggleButton 
        isDarkMode={isDarkMode} 
        onClick={() => setIsOpen(!isOpen)}
        title={t('commandCenter.enterpriseDebugPanel')}
      >
        {isOpen ? '×' : '⚙️'}
      </ToggleButton>

      {isOpen && (
        <DebugContent>
          <Section>
            <SectionTitle isDarkMode={isDarkMode}>{t('commandCenter.systemHealth')}</SectionTitle>
            {health ? (
              <>
                <MetricRow isDarkMode={isDarkMode}>
                  <span>
                    <StatusIndicator status={health.overall} />
                    {t('commandCenter.overall')}
                  </span>
                  <span>{health.overall}</span>
                </MetricRow>
                <MetricRow isDarkMode={isDarkMode}>
                  <span>{t('commandCenter.uptime')}</span>
                  <span>{Math.round(health.uptime / 1000)}s</span>
                </MetricRow>
                <MetricRow isDarkMode={isDarkMode}>
                  <span>{t('commandCenter.version')}</span>
                  <span>{health.version}</span>
                </MetricRow>
                {health.checks.map(check => (
                  <MetricRow key={check.name} isDarkMode={isDarkMode}>
                    <span>
                      <StatusIndicator status={check.status} />
                      {check.name}
                    </span>
                    <span>{check.responseTime?.toFixed(0)}ms</span>
                  </MetricRow>
                ))}
              </>
            ) : (
              <MetricRow isDarkMode={isDarkMode}>
                <span>{t('commandCenter.loading')}</span>
                <span>-</span>
              </MetricRow>
            )}
          </Section>

          <Section>
            <SectionTitle isDarkMode={isDarkMode}>{t('commandCenter.cacheStats')}</SectionTitle>
            {cacheStats ? (
              <>
                <MetricRow isDarkMode={isDarkMode}>
                  <span>{t('commandCenter.size')}</span>
                  <span>{cacheStats.size}/{cacheStats.maxSize}</span>
                </MetricRow>
                <MetricRow isDarkMode={isDarkMode}>
                  <span>{t('commandCenter.hitRate')}</span>
                  <span>{cacheStats.hitRate.toFixed(1)}%</span>
                </MetricRow>
                <MetricRow isDarkMode={isDarkMode}>
                  <span>{t('commandCenter.memory')}</span>
                  <span>{cacheStats.memoryUsage}</span>
                </MetricRow>
              </>
            ) : (
              <MetricRow isDarkMode={isDarkMode}>
                <span>{t('commandCenter.loading')}</span>
                <span>-</span>
              </MetricRow>
            )}
          </Section>

          <Section>
            <SectionTitle isDarkMode={isDarkMode}>{t('commandCenter.actions')}</SectionTitle>
            <div>
              <ActionButton isDarkMode={isDarkMode} onClick={clearCache}>
                {t('commandCenter.clearCache')}
              </ActionButton>
              <ActionButton isDarkMode={isDarkMode} onClick={exportHealth}>
                {t('commandCenter.exportHealth')}
              </ActionButton>
              <ActionButton isDarkMode={isDarkMode} onClick={exportAudit}>
                {t('commandCenter.exportAudit')}
              </ActionButton>
            </div>
          </Section>
        </DebugContent>
      )}
    </DebugContainer>
  )
}