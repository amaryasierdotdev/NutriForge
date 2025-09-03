import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  isDarkMode: boolean
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
  loading?: boolean
}

const CardContainer = styled(motion.div)<{
  isDarkMode: boolean
  variant: string
  padding: string
  clickable: boolean
  loading: boolean
}>`
  border-radius: 16px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  overflow: hidden;

  ${props => {
    const baseStyles = `
      background: ${props.isDarkMode
        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)'};
      border: 1px solid ${props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)'};
    `

    switch (props.variant) {
      case 'elevated':
        return `
          ${baseStyles}
          box-shadow: ${props.isDarkMode
            ? '0 20px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(148, 163, 184, 0.05)'
            : '0 20px 40px -8px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.05)'};
        `
      case 'outlined':
        return `
          background: transparent;
          border: 2px solid ${props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.1)'};
        `
      case 'glass':
        return `
          ${baseStyles}
          backdrop-filter: blur(24px);
          box-shadow: ${props.isDarkMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(148, 163, 184, 0.1)'
            : '0 8px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};
        `
      default:
        return `
          ${baseStyles}
          box-shadow: ${props.isDarkMode
            ? '0 4px 16px rgba(0, 0, 0, 0.2)'
            : '0 4px 16px rgba(15, 23, 42, 0.08)'};
        `
    }
  }}

  ${props => {
    switch (props.padding) {
      case 'sm': return 'padding: 16px;'
      case 'md': return 'padding: 24px;'
      case 'lg': return 'padding: 32px;'
      case 'xl': return 'padding: 40px;'
      default: return 'padding: 24px;'
    }
  }}

  ${props => props.clickable && `
    &:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: ${props.isDarkMode
        ? '0 12px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)'
        : '0 12px 24px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.15)'};
      border-color: ${props.isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
    }

    &:active {
      transform: translateY(-1px) scale(1.005);
    }
  `}

  ${props => props.loading && `
    pointer-events: none;
    opacity: 0.7;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59, 130, 246, 0.6) 25%,
      rgba(16, 185, 129, 0.6) 50%,
      rgba(139, 92, 246, 0.6) 75%,
      transparent 100%
    );
    opacity: ${props => props.variant === 'glass' ? 0.8 : 0.6};
  }
`

const CardHeader = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
`

const CardTitle = styled.h3<{ isDarkMode: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
  margin: 0 0 4px 0;
  line-height: 1.4;
`

const CardSubtitle = styled.p<{ isDarkMode: boolean }>`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  margin: 0;
  line-height: 1.5;
`

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
`

const CardContent = styled.div<{ hasHeader: boolean }>`
  ${props => !props.hasHeader && 'margin-top: 0;'}
`

const LoadingOverlay = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props =>
    props.isDarkMode
      ? 'rgba(15, 23, 42, 0.8)'
      : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`

const LoadingSpinner = styled.div<{ isDarkMode: boolean }>`
  width: 32px;
  height: 32px;
  border: 3px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.1)'};
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export const EnterpriseCard: React.FC<Props> = ({
  children,
  isDarkMode,
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'md',
  className,
  onClick,
  loading = false
}) => {
  const hasHeader = title || subtitle || actions
  const clickable = !!onClick

  return (
    <CardContainer
      isDarkMode={isDarkMode}
      variant={variant}
      padding={padding}
      clickable={clickable}
      loading={loading}
      className={className}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={clickable ? { y: -2, scale: 1.01 } : undefined}
      whileTap={clickable ? { y: -1, scale: 1.005 } : undefined}
    >
      {hasHeader && (
        <CardHeader isDarkMode={isDarkMode}>
          <div>
            {title && <CardTitle isDarkMode={isDarkMode}>{title}</CardTitle>}
            {subtitle && <CardSubtitle isDarkMode={isDarkMode}>{subtitle}</CardSubtitle>}
          </div>
          {actions && <CardActions>{actions}</CardActions>}
        </CardHeader>
      )}

      <CardContent hasHeader={!!hasHeader}>
        {children}
      </CardContent>

      {loading && (
        <LoadingOverlay isDarkMode={isDarkMode}>
          <LoadingSpinner isDarkMode={isDarkMode} />
        </LoadingOverlay>
      )}
    </CardContainer>
  )
}