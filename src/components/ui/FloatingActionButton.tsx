import React, { useState } from 'react'
import styled from 'styled-components'

const FABContainer = styled.div<{ isExpanded: boolean }>`
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`

const MainFAB = styled.button<{ isExpanded: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #3b82f6 100%);
  color: white;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(16, 185, 129, 0.6);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  
  &:hover::before {
    transform: translateX(100%);
  }
`

const ActionButton = styled.button<{ delay: number }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(15, 15, 15, 0.9);
  backdrop-filter: blur(16px);
  color: #d1d5db;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  animation: ${props => `slideIn 0.3s ease forwards ${props.delay}ms`};
  
  &:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
    transform: scale(1.1);
  }
  
  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`

const Tooltip = styled.div`
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 4px solid transparent;
    border-left-color: rgba(0, 0, 0, 0.9);
  }
`

const ActionButtonWithTooltip = styled.div`
  position: relative;
  
  &:hover ${Tooltip} {
    opacity: 1;
  }
`

interface FloatingActionButtonProps {
  onExport?: () => void
  onReset?: () => void
  onShare?: () => void
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onExport,
  onReset,
  onShare
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }
  
  return (
    <FABContainer isExpanded={isExpanded}>
      {isExpanded && (
        <>
          {onShare && (
            <ActionButtonWithTooltip>
              <ActionButton delay={0} onClick={onShare}>
                S
              </ActionButton>
              <Tooltip>Share Results</Tooltip>
            </ActionButtonWithTooltip>
          )}
          {onExport && (
            <ActionButtonWithTooltip>
              <ActionButton delay={100} onClick={onExport}>
                E
              </ActionButton>
              <Tooltip>Export Data</Tooltip>
            </ActionButtonWithTooltip>
          )}
          {onReset && (
            <ActionButtonWithTooltip>
              <ActionButton delay={200} onClick={onReset}>
                R
              </ActionButton>
              <Tooltip>Reset Form</Tooltip>
            </ActionButtonWithTooltip>
          )}
        </>
      )}
      <MainFAB isExpanded={isExpanded} onClick={toggleExpanded}>
        {isExpanded ? '×' : '+'}
      </MainFAB>
    </FABContainer>
  )
}