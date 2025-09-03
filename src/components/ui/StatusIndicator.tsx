import React from 'react'
import styled from 'styled-components'

const IndicatorContainer = styled.div<{ 
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'small' | 'medium' | 'large'
}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.size === 'large' ? '12px 16px' : props.size === 'medium' ? '8px 12px' : '6px 10px'};
  border-radius: ${props => props.size === 'large' ? '12px' : '8px'};
  font-size: ${props => props.size === 'large' ? '14px' : props.size === 'medium' ? '13px' : '12px'};
  font-weight: 500;
  backdrop-filter: blur(8px);
  border: 1px solid;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        `
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        `
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        `
      case 'info':
        return `
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        `
      default:
        return `
          background: rgba(156, 163, 175, 0.1);
          border-color: rgba(156, 163, 175, 0.3);
          color: #9ca3af;
        `
    }
  }}
`

const StatusDot = styled.div<{ status: 'success' | 'warning' | 'error' | 'info' | 'neutral' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        `
      case 'warning':
        return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        `
      case 'error':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        `
      case 'info':
        return `
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
        `
      default:
        return `
          background: linear-gradient(135deg, #9ca3af, #6b7280);
          box-shadow: 0 0 8px rgba(156, 163, 175, 0.4);
        `
    }
  }}
`

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  className?: string
  style?: React.CSSProperties
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  children,
  size = 'medium',
  className,
  style
}) => {
  return (
    <IndicatorContainer status={status} size={size} className={className} style={style}>
      <StatusDot status={status} />
      {children}
    </IndicatorContainer>
  )
}