import React from 'react'
import styled from 'styled-components'

const MetricContainer = styled.div<{ variant: 'default' | 'highlighted' | 'compact'; isDarkMode?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.variant === 'compact' ? '12px 16px' : '16px 20px'};
  margin-bottom: 8px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${props => {
    const isDark = props.isDarkMode;
    switch (props.variant) {
      case 'highlighted':
        return `
          background: linear-gradient(135deg, rgba(16, 185, 129, ${isDark ? '0.08' : '0.05'}) 0%, rgba(59, 130, 246, ${isDark ? '0.05' : '0.03'}) 100%);
          border: 1px solid rgba(16, 185, 129, ${isDark ? '0.2' : '0.3'});
        `
      case 'compact':
        return `
          background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(248, 250, 252, 0.8)'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'};
        `
      default:
        return `
          background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(248, 250, 252, 0.6)'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        `
    }
  }}
  
  &:hover {
    transform: translateX(4px);
    ${props => {
      const isDark = props.isDarkMode;
      return props.variant === 'highlighted' ? `
        background: linear-gradient(135deg, rgba(16, 185, 129, ${isDark ? '0.12' : '0.08'}) 0%, rgba(59, 130, 246, ${isDark ? '0.08' : '0.05'}) 100%);
        border-color: rgba(16, 185, 129, ${isDark ? '0.3' : '0.4'});
      ` : `
        background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(248, 250, 252, 0.9)'};
        border-color: ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'};
      `
    }}
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${props => props.variant === 'highlighted' ? 
      'linear-gradient(to bottom, #10b981, #3b82f6)' : 
      (props.isDarkMode ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))' : 'linear-gradient(to bottom, rgba(16, 185, 129, 0.4), rgba(16, 185, 129, 0.2))')};
    border-radius: 0 2px 2px 0;
  }
`

const MetricLabel = styled.div<{ variant: 'default' | 'highlighted' | 'compact'; isDarkMode?: boolean }>`
  font-size: ${props => props.variant === 'compact' ? '13px' : '14px'};
  color: ${props => {
    if (props.variant === 'highlighted') return props.isDarkMode ? '#ffffff' : '#1f2937';
    return props.isDarkMode ? '#f9fafb' : '#374151';
  }};
  font-weight: 500;
  flex: 1;
`

const MetricValue = styled.div<{ variant: 'default' | 'highlighted' | 'compact'; isDarkMode?: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: ${props => props.variant === 'compact' ? '16px' : '18px'};
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const MetricUnit = styled.span<{ variant: 'default' | 'highlighted' | 'compact'; isDarkMode?: boolean }>`
  font-size: ${props => props.variant === 'compact' ? '12px' : '13px'};
  font-weight: 500;
  color: ${props => {
    if (props.variant === 'highlighted') return '#10b981';
    return props.isDarkMode ? '#9ca3af' : '#64748b';
  }};
  opacity: 0.8;
`

const TrendIndicator = styled.div<{ trend: 'up' | 'down' | 'neutral' }>`
  width: 0;
  height: 0;
  margin-left: 8px;
  
  ${props => {
    switch (props.trend) {
      case 'up':
        return `
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 6px solid #10b981;
        `
      case 'down':
        return `
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 6px solid #ef4444;
        `
      default:
        return `
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6b7280;
        `
    }
  }}
`

interface EnhancedMetricDisplayProps {
  label: string
  value: string | number
  unit?: string
  variant?: 'default' | 'highlighted' | 'compact'
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  style?: React.CSSProperties
  isDarkMode?: boolean
}

export const EnhancedMetricDisplay: React.FC<EnhancedMetricDisplayProps> = ({
  label,
  value,
  unit,
  variant = 'default',
  trend,
  className,
  style,
  isDarkMode = true
}) => {
  return (
    <MetricContainer variant={variant} isDarkMode={isDarkMode} className={className} style={style}>
      <MetricLabel variant={variant} isDarkMode={isDarkMode}>{label}</MetricLabel>
      <MetricValue variant={variant} isDarkMode={isDarkMode}>
        {value}
        {unit && <MetricUnit variant={variant} isDarkMode={isDarkMode}>{unit}</MetricUnit>}
        {trend && <TrendIndicator trend={trend} />}
      </MetricValue>
    </MetricContainer>
  )
}