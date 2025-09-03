import React from 'react'
import styled from 'styled-components'


const AlertContainer = styled.div<{ variant?: 'info' | 'success' | 'warning' | 'error' }>`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid;
  font-size: 15px;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
  }
  
  ${props => {
    switch(props.variant) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
          
          &::before {
            background: #10b981;
          }
        `
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          
          &::before {
            background: #f59e0b;
          }
        `
      case 'error':
        return `
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          
          &::before {
            background: #ef4444;
          }
        `
      default:
        return `
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          
          &::before {
            background: #3b82f6;
          }
        `
    }
  }}
`

const AlertContent = styled.div`
  flex: 1;
  line-height: 1.5;
`

const AlertTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
`

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, children, style }) => {
  const getIcon = () => {
    switch(variant) {
      case 'success': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✕'
      default: return 'ℹ'
    }
  }

  return (
    <AlertContainer variant={variant} style={style}>
      <div style={{ fontSize: '18px', lineHeight: 1, marginTop: '2px' }}>
        {getIcon()}
      </div>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        {children}
      </AlertContent>
    </AlertContainer>
  )
}