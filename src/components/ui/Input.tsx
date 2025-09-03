import React from 'react'
import styled from 'styled-components'

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`

const StyledInput = styled.input<{ hasError?: boolean; isDarkMode?: boolean }>`
  width: 100%;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.8) 0%, rgba(9, 9, 11, 0.9) 100%)' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'
  };
  border: 1px solid ${props => 
    props.hasError ? '#ef4444' : 
    props.isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
  };
  border-radius: 16px;
  padding: 18px 24px;
  color: ${props => props.isDarkMode ? '#f9fafb' : '#1e293b'};
  font-size: 15px;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(16px);
  box-shadow: ${props => props.isDarkMode
    ? '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    : '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#10b981'};
    background: ${props => props.isDarkMode 
      ? 'linear-gradient(145deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)' 
      : 'linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.98) 100%)'
    };
    box-shadow: ${props => props.hasError 
      ? '0 0 0 3px rgba(239, 68, 68, 0.15), 0 8px 32px rgba(239, 68, 68, 0.1)' 
      : `0 0 0 3px rgba(16, 185, 129, 0.15), 0 8px 32px rgba(16, 185, 129, 0.1), ${props.isDarkMode ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.9)'}`
    };
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: ${props => props.isDarkMode ? '#6b7280' : '#94a3b8'};
    font-weight: 300;
  }
  
  &:hover:not(:focus) {
    border-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
    transform: translateY(-1px);
    box-shadow: ${props => props.isDarkMode
      ? '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      : '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
    };
  }
`

const Label = styled.label<{ isDarkMode?: boolean }>`
  display: block;
  font-size: 13px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#374151'};
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.01em;
`

const ErrorText = styled.span`
  font-size: 11px;
  color: #ff4444;
  margin-top: 4px;
  display: block;
`

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  isDarkMode?: boolean
}

export const Input: React.FC<InputProps> = ({ label, error, isDarkMode, ...props }) => (
  <InputWrapper>
    {label && <Label isDarkMode={isDarkMode}>{label}</Label>}
    <StyledInput
      hasError={!!error}
      isDarkMode={isDarkMode}
      {...props}
    />
    {error && <ErrorText>{error}</ErrorText>}
  </InputWrapper>
)