import React from 'react'
import styled from 'styled-components'

const ChartContainer = styled.div`
  width: 100%;
  height: 120px;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: end;
  padding: 16px;
  gap: 8px;
`

const Bar = styled.div<{ height: number; color: string; delay: number }>`
  flex: 1;
  background: ${props => props.color};
  border-radius: 4px 4px 0 0;
  height: ${props => props.height}%;
  transition: height 0.8s ease;
  transition-delay: ${props => props.delay}s;
  position: relative;
  min-height: 4px;
`

const BarLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #666;
  white-space: nowrap;
`

const BarValue = styled.div`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
`

interface ChartData {
  label: string
  value: number
  color: string
}

interface ChartProps {
  data: ChartData[]
}

export const Chart: React.FC<ChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <ChartContainer>
      {data.map((item, index) => (
        <Bar
          key={item.label}
          height={(item.value / maxValue) * 80}
          color={item.color}
          delay={index * 0.1}
        >
          <BarValue>{Math.round(item.value)}</BarValue>
          <BarLabel>{item.label}</BarLabel>
        </Bar>
      ))}
    </ChartContainer>
  )
}