import React, { useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '../../hooks/useTranslation'

const ToastContainer = styled(motion.div)<{ type: 'success' | 'error' | 'info' }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  padding: 20px 24px;
  border-radius: 16px;
  backdrop-filter: blur(24px);
  border: 1px solid ${props => 
    props.type === 'success' ? 'rgba(16, 185, 129, 0.4)' :
    props.type === 'error' ? 'rgba(239, 68, 68, 0.4)' :
    'rgba(59, 130, 246, 0.4)'
  };
  background: ${props => 
    props.type === 'success' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)' :
    props.type === 'error' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)' :
    'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
  };
  color: ${props => 
    props.type === 'success' ? '#ffffff' :
    props.type === 'error' ? '#ffffff' :
    '#ffffff'
  };
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 320px;
  max-width: 420px;
  box-shadow: ${props => 
    props.type === 'success' ? '0 24px 48px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' :
    props.type === 'error' ? '0 24px 48px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' :
    '0 24px 48px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  };
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => 
      props.type === 'success' ? 'linear-gradient(90deg, transparent, #10b981, transparent)' :
      props.type === 'error' ? 'linear-gradient(90deg, transparent, #ef4444, transparent)' :
      'linear-gradient(90deg, transparent, #3b82f6, transparent)'
    };
    border-radius: 16px 16px 0 0;
  }
`

const ToastIcon = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.8;
`

const ToastMessage = styled.div`
  flex: 1;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`

interface NotificationToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const { t } = useTranslation()
  
  const getStatusText = () => {
    switch (type) {
      case 'success': return t('toast.success')
      case 'error': return t('toast.error')
      case 'info': return t('toast.info')
      default: return t('toast.info')
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <ToastContainer
          type={type}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <ToastIcon>{getStatusText()}</ToastIcon>
          <ToastMessage>{message}</ToastMessage>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ToastContainer>
      )}
    </AnimatePresence>
  )
}