import React from 'react'
import styled from 'styled-components'

const ProgressRing = styled.div<{ percentage: number; size: number }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  
  svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }
  
  .progress-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 3;
  }
  
  .progress-fill {
    fill: none;
    stroke: url(#gradient);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: ${props => {
      const circumference = 2 * Math.PI * 45;
      return `${(props.percentage / 100) * circumference} ${circumference}`;
    }};
    transition: stroke-dasharray 0.8s ease;
  }
`

const CenterContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`

const BarChart = styled.div`
  display: flex;
  align-items: end;
  gap: 8px;
  height: 60px;
  padding: 8px;
`

const Bar = styled.div<{ height: number; color: string }>`
  flex: 1;
  height: ${props => props.height}%;
  background: linear-gradient(to top, ${props => props.color}40, ${props => props.color});
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scaleY(1.1);
    filter: brightness(1.2);
  }
`

interface CircularProgressProps {
  percentage: number
  size?: number
  children?: React.ReactNode
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  size = 100, 
  children 
}) => {
  return (
    <ProgressRing percentage={percentage} size={size}>
      <svg>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" className="progress-bg" />
        <circle cx="50" cy="50" r="45" className="progress-fill" />
      </svg>
      <CenterContent>{children}</CenterContent>
    </ProgressRing>
  )
}

interface MiniBarChartProps {
  data: { value: number; color: string; label: string }[]
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <BarChart>
      {data.map((item, index) => (
        <Bar
          key={index}
          height={(item.value / maxValue) * 100}
          color={item.color}
          title={`${item.label}: ${item.value}`}
        />
      ))}
    </BarChart>
  )
}