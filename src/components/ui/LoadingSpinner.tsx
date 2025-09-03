import React from 'react'
import styled, { keyframes, css } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`

const SpinnerRing = styled.div`
  width: 60px;
  height: 60px;
  border: 3px solid rgba(16, 185, 129, 0.1);
  border-top: 3px solid #10b981;
  border-radius: 50%;
  ${css`animation: ${spin} 1s linear infinite;`}
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
  }
`

const LoadingText = styled.div`
  font-size: 16px;
  color: #9ca3af;
  font-weight: 500;
  text-align: center;
  ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  span {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    ${css`animation: ${pulse} 1.4s ease-in-out infinite;`}
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`

interface LoadingSpinnerProps {
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "Processing Analytics..." 
}) => {
  return (
    <SpinnerContainer>
      <SpinnerRing />
      <LoadingText>{text}</LoadingText>
      <LoadingDots>
        <span />
        <span />
        <span />
      </LoadingDots>
    </SpinnerContainer>
  )
}