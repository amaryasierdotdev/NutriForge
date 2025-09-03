import React from 'react'
import styled from 'styled-components'

const ProgressContainer = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  width: ${props => props.progress}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
`

const ProgressLabel = styled.span`
  color: #9ca3af;
  font-weight: 400;
`

const ProgressValue = styled.span`
  color: #10b981;
  font-weight: 500;
`

interface ProgressProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  label, 
  showValue = true 
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div>
      {(label || showValue) && (
        <ProgressText>
          {label && <ProgressLabel>{label}</ProgressLabel>}
          {showValue && <ProgressValue>{Math.round(percentage)}%</ProgressValue>}
        </ProgressText>
      )}
      <ProgressContainer>
        <ProgressBar progress={percentage} />
      </ProgressContainer>
    </div>
  )
}