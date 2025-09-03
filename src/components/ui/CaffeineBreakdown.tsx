import React from 'react'
import styled from 'styled-components'
import { MetricDisplay } from './MetricDisplay'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  weight: number
  multiplier: number
  isDarkMode: boolean
  type: 'training' | 'rest'
}

const CaffeineContainer = styled.div<{ isDarkMode: boolean }>`
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(101, 67, 33, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(101, 67, 33, 0.03) 100%)'};
  border: 1px solid ${props =>
    props.isDarkMode ? 'rgba(139, 69, 19, 0.2)' : 'rgba(139, 69, 19, 0.15)'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`

const CaffeineHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`

const CoffeeIcon = styled.span`
  font-size: 16px;
`

const CaffeineTitle = styled.h5<{ isDarkMode: boolean }>`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#d2b48c' : '#8b4513'};
`

const CaffeineBreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 24px;
  border-left: 2px solid rgba(139, 69, 19, 0.2);
`

const SubMetric = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${props =>
    props.isDarkMode
      ? 'rgba(139, 69, 19, 0.05)'
      : 'rgba(139, 69, 19, 0.03)'};
  border-radius: 8px;
  font-size: 13px;
`

const SubLabel = styled.span<{ isDarkMode: boolean }>`
  color: ${props => props.isDarkMode ? '#a0a0a0' : '#666666'};
  display: flex;
  align-items: center;
  gap: 6px;
`

const SubValue = styled.span<{ isDarkMode: boolean }>`
  color: ${props => props.isDarkMode ? '#d2b48c' : '#8b4513'};
  font-weight: 500;
`

export const CaffeineBreakdown: React.FC<Props> = ({
  weight,
  multiplier,
  isDarkMode,
  type
}) => {
  const { t } = useTranslation()
  
  const totalCaffeine = weight * multiplier
  const coffeeTeaspoons = Math.ceil(totalCaffeine / 30)
  const actualCaffeineFromCoffee = coffeeTeaspoons * 30
  
  return (
    <>
      <CaffeineContainer isDarkMode={isDarkMode}>
        <CaffeineHeader>
          <CoffeeIcon>☕</CoffeeIcon>
          <CaffeineTitle isDarkMode={isDarkMode}>
            {t('supplements.caffeineBreakdown')}
          </CaffeineTitle>
        </CaffeineHeader>
        
        <CaffeineBreakdownList>
          <SubMetric isDarkMode={isDarkMode}>
            <SubLabel isDarkMode={isDarkMode}>
              <span>🥄</span>
              {t('supplements.coffeeTeaspoons')}
            </SubLabel>
            <SubValue isDarkMode={isDarkMode}>
              {coffeeTeaspoons} {t('supplements.tsp')}
            </SubValue>
          </SubMetric>
          
          <SubMetric isDarkMode={isDarkMode}>
            <SubLabel isDarkMode={isDarkMode}>
              <span>⚡</span>
              {t('supplements.caffeineFromCoffee')}
            </SubLabel>
            <SubValue isDarkMode={isDarkMode}>
              {actualCaffeineFromCoffee} mg
            </SubValue>
          </SubMetric>
          
          {actualCaffeineFromCoffee !== totalCaffeine && (
            <SubMetric isDarkMode={isDarkMode}>
              <SubLabel isDarkMode={isDarkMode}>
                <span>➕</span>
                {t('supplements.additionalCaffeine')}
              </SubLabel>
              <SubValue isDarkMode={isDarkMode}>
                {Math.max(0, totalCaffeine - actualCaffeineFromCoffee)} mg
              </SubValue>
            </SubMetric>
          )}
        </CaffeineBreakdownList>
      </CaffeineContainer>
      
      <MetricDisplay
        label={t(`supplements.caffeine${type === 'training' ? 'PreWorkout' : ''}`)}
        value={totalCaffeine.toFixed(0)}
        unit="mg"
        isDarkMode={isDarkMode}
      />
    </>
  )
}