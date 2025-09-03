import React from 'react'
import styled from 'styled-components'

const ToggleContainer = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.isDarkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  backdrop-filter: blur(8px);
`

const ToggleButton = styled.button<{ active: boolean; isDarkMode: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
    : 'transparent'
  };
  color: ${props => props.active 
    ? '#ffffff'
    : props.isDarkMode ? '#9ca3af' : '#64748b'
  };
  
  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #059669 0%, #2563eb 100%)'
      : props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
    };
  }
`

interface InputModeToggleProps {
  useSliders: boolean
  onToggle: () => void
  isDarkMode: boolean
}

export const InputModeToggle: React.FC<InputModeToggleProps> = ({
  useSliders,
  onToggle,
  isDarkMode
}) => {
  return (
    <ToggleContainer isDarkMode={isDarkMode}>
      <span style={{ fontSize: '12px', color: isDarkMode ? '#6b7280' : '#64748b' }}>
        Input:
      </span>
      <ToggleButton
        active={useSliders}
        isDarkMode={isDarkMode}
        onClick={onToggle}
        type="button"
      >
        🎚️ Slider
      </ToggleButton>
      <ToggleButton
        active={!useSliders}
        isDarkMode={isDarkMode}
        onClick={onToggle}
        type="button"
      >
        ⌨️ Keyboard
      </ToggleButton>
    </ToggleContainer>
  )
}