import React from 'react'
import styled, { keyframes, css } from 'styled-components'

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`

const ProgressFill = styled.div<{ progress: number; animated?: boolean }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #10b981, #059669, #3b82f6);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
  
  ${props => props.animated && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      background-size: 200px 100%;
      ${css`animation: ${shimmer} 2s infinite;`}
    }
  `}
`

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
`

interface ProgressBarProps {
  progress: number
  label?: string
  showPercentage?: boolean
  animated?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  animated = false
}) => {
  return (
    <div>
      {(label || showPercentage) && (
        <ProgressLabel>
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(progress)}%</span>}
        </ProgressLabel>
      )}
      <ProgressContainer>
        <ProgressFill progress={progress} animated={animated} />
      </ProgressContainer>
    </div>
  )
}