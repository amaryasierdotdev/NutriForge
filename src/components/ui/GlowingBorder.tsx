import React from 'react'
import styled from 'styled-components'

const BorderContainer = styled.div<{ intensity?: 'low' | 'medium' | 'high' }>`
  position: relative;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    ${props => props.intensity === 'high' ? 'rgba(16, 185, 129, 0.4)' : 
              props.intensity === 'medium' ? 'rgba(16, 185, 129, 0.2)' : 
              'rgba(16, 185, 129, 0.1)'} 0%,
    ${props => props.intensity === 'high' ? 'rgba(59, 130, 246, 0.4)' : 
              props.intensity === 'medium' ? 'rgba(59, 130, 246, 0.2)' : 
              'rgba(59, 130, 246, 0.1)'} 50%,
    ${props => props.intensity === 'high' ? 'rgba(139, 92, 246, 0.4)' : 
              props.intensity === 'medium' ? 'rgba(139, 92, 246, 0.2)' : 
              'rgba(139, 92, 246, 0.1)'} 100%
  );
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
  }
`

const Content = styled.div`
  background: inherit;
  border-radius: 15px;
  height: 100%;
  width: 100%;
`

interface GlowingBorderProps {
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
  className?: string
  style?: React.CSSProperties
}

export const GlowingBorder: React.FC<GlowingBorderProps> = ({ 
  children, 
  intensity = 'low',
  className,
  style 
}) => {
  return (
    <BorderContainer intensity={intensity} className={className} style={style}>
      <Content>
        {children}
      </Content>
    </BorderContainer>
  )
}