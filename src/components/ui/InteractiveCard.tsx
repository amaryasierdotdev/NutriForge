import React, { useState } from 'react'
import styled from 'styled-components'

const CardContainer = styled.div<{ isHovered: boolean; variant: 'default' | 'premium' | 'elite'; isDarkMode?: boolean }>`
  position: relative;
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(32px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  
  ${props => {
    const isDark = props.isDarkMode;
    switch (props.variant) {
      case 'premium':
        return `
          background: ${isDark ? `
            linear-gradient(135deg, rgba(15, 15, 15, 0.9) 0%, rgba(9, 9, 11, 0.95) 100%),
            radial-gradient(circle at top right, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
            radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.03) 0%, transparent 50%)` : `
            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%),
            radial-gradient(circle at top right, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05) 0%, transparent 50%)`};
          border: 1px solid rgba(16, 185, 129, ${isDark ? '0.2' : '0.3'});
        `
      case 'elite':
        return `
          background: ${isDark ? `
            linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%),
            radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
            radial-gradient(circle at top left, rgba(16, 185, 129, 0.04) 0%, transparent 50%)` : `
            linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%),
            radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
            radial-gradient(circle at top left, rgba(16, 185, 129, 0.06) 0%, transparent 50%)`};
          border: 1px solid rgba(139, 92, 246, ${isDark ? '0.3' : '0.4'});
        `
      default:
        return `
          background: ${isDark ? `
            linear-gradient(135deg, rgba(15, 15, 15, 0.85) 0%, rgba(9, 9, 11, 0.9) 100%),
            radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, transparent 70%)` : `
            linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%),
            radial-gradient(circle at center, rgba(0, 0, 0, 0.02) 0%, transparent 70%)`};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'};
        `
    }
  }}
  
  ${props => props.isHovered && `
    transform: translateY(-12px) scale(1.03);
    box-shadow: 
      0 48px 96px -12px rgba(0, 0, 0, 0.9),
      0 0 80px ${props.variant === 'elite' ? 'rgba(139, 92, 246, 0.3)' : 
                 props.variant === 'premium' ? 'rgba(16, 185, 129, 0.25)' : 
                 'rgba(255, 255, 255, 0.15)'},
      inset 0 2px 0 rgba(255, 255, 255, 0.15);
    border-color: ${props.variant === 'elite' ? 'rgba(139, 92, 246, 0.5)' : 
                   props.variant === 'premium' ? 'rgba(16, 185, 129, 0.4)' : 
                   'rgba(255, 255, 255, 0.2)'};
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => {
      switch (props.variant) {
        case 'premium':
          return 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.6), transparent)'
        case 'elite':
          return 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), rgba(16, 185, 129, 0.4), transparent)'
        default:
          return 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
      }
    }};
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      ${props => props.variant === 'elite' ? 'rgba(139, 92, 246, 0.03)' : 
                 props.variant === 'premium' ? 'rgba(16, 185, 129, 0.03)' : 
                 'rgba(255, 255, 255, 0.02)'} 0%,
      transparent 70%
    );
    z-index: -1;
    opacity: ${props => props.isHovered ? 1 : 0.7};
    transition: opacity 0.3s ease;
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`

const CardTitle = styled.h3<{ variant: 'default' | 'premium' | 'elite'; isDarkMode?: boolean }>`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => {
    const isDark = props.isDarkMode;
    if (props.variant === 'default') {
      return isDark ? '#ffffff' : '#0f172a';
    }
    return 'transparent';
  }};
  background: ${props => {
    const isDark = props.isDarkMode;
    switch (props.variant) {
      case 'premium':
        return isDark ? 'linear-gradient(135deg, #ffffff 0%, #10b981 100%)' : 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)'
      case 'elite':
        return isDark ? 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 50%, #10b981 100%)' : 'linear-gradient(135deg, #0f172a 0%, #8b5cf6 50%, #10b981 100%)'
      default:
        return 'transparent'
    }
  }};
  ${props => props.variant !== 'default' && `
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

const Badge = styled.div<{ variant: 'default' | 'premium' | 'elite'; isDarkMode?: boolean }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    const isDark = props.isDarkMode;
    switch (props.variant) {
      case 'premium':
        return `
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        `
      case 'elite':
        return `
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
          border: 1px solid rgba(139, 92, 246, 0.3);
        `
      default:
        return `
          background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          color: ${isDark ? '#d1d5db' : '#475569'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
        `
    }
  }}
`

interface InteractiveCardProps {
  title: string
  badge?: string
  variant?: 'default' | 'premium' | 'elite'
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  isDarkMode?: boolean
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  badge,
  variant = 'default',
  children,
  onClick,
  className,
  style,
  isDarkMode = true
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <CardContainer
      variant={variant}
      isHovered={isHovered}
      isDarkMode={isDarkMode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={className}
      style={style}
    >
      <CardHeader>
        <CardTitle variant={variant} isDarkMode={isDarkMode}>{title}</CardTitle>
        {badge && <Badge variant={variant} isDarkMode={isDarkMode}>{badge}</Badge>}
      </CardHeader>
      {children}
    </CardContainer>
  )
}