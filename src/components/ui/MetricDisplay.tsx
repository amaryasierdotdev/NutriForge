import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const MetricRow = styled(motion.div)<{ isDarkMode?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin: 8px 0;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, rgba(15, 15, 15, 0.6) 0%, rgba(9, 9, 11, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)'
  };
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
  border-radius: 12px;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.isDarkMode
    ? '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    : '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: ${props => props.isDarkMode
      ? '0 8px 32px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
    };
  }
`

const MetricLabel = styled.span<{ isDarkMode?: boolean }>`
  color: ${props => props.isDarkMode ? '#9ca3af' : '#475569'};
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.01em;
`

const MetricValue = styled.span<{ isDarkMode?: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#0f172a'};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 4px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const MetricUnit = styled.span<{ isDarkMode?: boolean }>`
  color: ${props => props.isDarkMode ? '#6b7280' : '#64748b'};
  font-size: 13px;
  font-weight: 400;
`

interface MetricDisplayProps {
  label: string
  value: number | string
  unit?: string
  index?: number
  isDarkMode?: boolean
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ 
  label, 
  value, 
  unit,
  index = 0,
  isDarkMode = true
}) => (
  <MetricRow
    isDarkMode={isDarkMode}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
  >
    <MetricLabel isDarkMode={isDarkMode}>{label}</MetricLabel>
    <MetricValue isDarkMode={isDarkMode}>
      {typeof value === 'number' ? Math.round(value) : value}
      {unit && <MetricUnit isDarkMode={isDarkMode}>{unit}</MetricUnit>}
    </MetricValue>
  </MetricRow>
)