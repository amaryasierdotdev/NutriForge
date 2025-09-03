import React from 'react'
import styled from 'styled-components'

const BorderContainer = styled.div<{ 
  borderWidth?: number
  borderRadius?: number
  gradient?: string
}>`
  position: relative;
  padding: ${props => props.borderWidth || 1}px;
  border-radius: ${props => props.borderRadius || 12}px;
  background: ${props => props.gradient || 'linear-gradient(135deg, #10b981, #059669, #3b82f6)'};
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: ${props => props.borderWidth || 1}px;
    background: ${props => props.gradient || 'linear-gradient(135deg, #10b981, #059669, #3b82f6)'};
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
  }
`

const Content = styled.div<{ borderRadius?: number }>`
  position: relative;
  background: rgba(9, 9, 11, 0.95);
  border-radius: ${props => (props.borderRadius || 12) - 1}px;
  height: 100%;
  width: 100%;
`

interface GradientBorderProps {
  children: React.ReactNode
  borderWidth?: number
  borderRadius?: number
  gradient?: string
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  borderWidth = 1,
  borderRadius = 12,
  gradient = 'linear-gradient(135deg, #10b981, #059669, #3b82f6)'
}) => {
  return (
    <BorderContainer 
      borderWidth={borderWidth} 
      borderRadius={borderRadius}
      gradient={gradient}
    >
      <Content borderRadius={borderRadius}>
        {children}
      </Content>
    </BorderContainer>
  )
}