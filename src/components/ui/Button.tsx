import React from 'react'
import styled from 'styled-components'

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary'; isDarkMode?: boolean }>`
  width: 100%;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  ${props => props.variant === 'secondary' ? `
    background: ${props.isDarkMode ? 'rgba(9, 9, 11, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
    color: ${props.isDarkMode ? '#f9fafb' : '#1e293b'};
    border: 1px solid ${props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    backdrop-filter: blur(12px);
    
    &:hover:not(:disabled) {
      border-color: rgba(16, 185, 129, 0.3);
      background: rgba(16, 185, 129, 0.05);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
    }
  ` : `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
  `}
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
  children: React.ReactNode
  isDarkMode?: boolean
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  loading, 
  children, 
  isDarkMode,
  ...props 
}) => (
  <StyledButton
    variant={variant}
    isDarkMode={isDarkMode}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <LoadingSpinner /> : children}
  </StyledButton>
)