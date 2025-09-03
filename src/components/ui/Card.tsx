import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const StyledCard = styled(motion.div)<{ padding?: 'sm' | 'md' | 'lg'; isDarkMode?: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.15)'};
  border-radius: 20px;
  padding: ${props => {
    switch(props.padding) {
      case 'sm': return '20px'
      case 'lg': return '40px'
      default: return '32px'
    }
  }};
  backdrop-filter: blur(24px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent);
  }
  
  &:hover {
    border-color: rgba(16, 185, 129, 0.15);
    transform: translateY(-2px);
    box-shadow: ${props => props.isDarkMode 
      ? '0 20px 40px -12px rgba(0, 0, 0, 0.4)'
      : '0 20px 40px -12px rgba(0, 0, 0, 0.15)'
    };
  }
`

const CardHeader = styled.div<{ isDarkMode?: boolean }>`
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.1)'};
`

const CardTitle = styled.h3<{ isDarkMode?: boolean }>`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.isDarkMode ? '#f9fafb' : '#0f172a'};
  margin: 0;
  letter-spacing: -0.01em;
`

const CardContent = styled.div<{ isDarkMode?: boolean }>`
  color: ${props => props.isDarkMode ? '#d1d5db' : '#1e293b'};
`

interface CardProps {
  title?: string
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  isDarkMode?: boolean
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  padding = 'md', 
  children, 
  className,
  style,
  isDarkMode 
}) => (
  <StyledCard
    padding={padding}
    className={className}
    style={style}
    isDarkMode={isDarkMode}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {title && (
      <CardHeader isDarkMode={isDarkMode}>
        <CardTitle isDarkMode={isDarkMode}>{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent isDarkMode={isDarkMode}>{children}</CardContent>
  </StyledCard>
)