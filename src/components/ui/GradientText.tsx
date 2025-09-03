import React from 'react'
import styled from 'styled-components'

const StyledText = styled.span<{ 
  variant: 'primary' | 'secondary' | 'accent' | 'rainbow'
  size?: 'small' | 'medium' | 'large' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}>`
  background: ${props => {
    switch (props.variant) {
      case 'primary':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      case 'secondary':
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
      case 'accent':
        return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      case 'rainbow':
        return 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)'
      default:
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '12px'
      case 'medium': return '14px'
      case 'large': return '16px'
      case 'xl': return '18px'
      default: return '14px'
    }
  }};
  font-weight: ${props => {
    switch (props.weight) {
      case 'normal': return '400'
      case 'medium': return '500'
      case 'semibold': return '600'
      case 'bold': return '700'
      default: return '500'
    }
  }};
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.2));
`

interface GradientTextProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'rainbow'
  size?: 'small' | 'medium' | 'large' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  className?: string
  style?: React.CSSProperties
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  weight = 'medium',
  className,
  style
}) => {
  return (
    <StyledText 
      variant={variant} 
      size={size} 
      weight={weight}
      className={className}
      style={style}
    >
      {children}
    </StyledText>
  )
}