import React from 'react'
import styled, { keyframes, css } from 'styled-components'

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.2); }
`

const EnhancedCardContainer = styled.div`
  position: relative;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(
    45deg,
    rgba(16, 185, 129, 0.2),
    rgba(59, 130, 246, 0.2),
    rgba(139, 92, 246, 0.2),
    rgba(16, 185, 129, 0.2)
  );
  background-size: 400% 400%;
  ${css`animation: ${shimmer} 3s ease-in-out infinite;`}
  
  &:hover {
    ${css`animation: ${shimmer} 1.5s ease-in-out infinite, ${glow} 2s ease-in-out infinite;`}
  }
`

const CardContent = styled.div`
  background: linear-gradient(
    135deg,
    rgba(15, 15, 15, 0.95) 0%,
    rgba(9, 9, 11, 0.98) 100%
  );
  border-radius: 18px;
  padding: 32px;
  height: 100%;
  position: relative;
  backdrop-filter: blur(32px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }
`

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({ 
  children, 
  className, 
  style 
}) => {
  return (
    <EnhancedCardContainer className={className} style={style}>
      <CardContent>
        {children}
      </CardContent>
    </EnhancedCardContainer>
  )
}