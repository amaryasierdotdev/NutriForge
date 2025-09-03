import React from 'react'
import styled, { keyframes, css } from 'styled-components'

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
`

const FloatingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`

const FloatingOrb = styled.div<{ size: number; delay: number; duration: number; x: number; y: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  ${props => css`
    animation: 
      ${float} ${props.duration}s ease-in-out infinite ${props.delay}s,
      ${pulse} ${props.duration * 1.5}s ease-in-out infinite ${props.delay}s;
  `}
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  filter: blur(1px);
`

export const FloatingElements: React.FC = () => {
  const orbs = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }))

  return (
    <FloatingContainer>
      {orbs.map(orb => (
        <FloatingOrb
          key={orb.id}
          size={orb.size}
          delay={orb.delay}
          duration={orb.duration}
          x={orb.x}
          y={orb.y}
        />
      ))}
    </FloatingContainer>
  )
}