import React from 'react'
import styled, { keyframes, css } from 'styled-components'

const moveGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
`

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-30px, 30px) rotate(-120deg); }
  66% { transform: translate(20px, -20px) rotate(-240deg); }
`

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
`

const GradientOrb = styled.div<{ 
  size: number
  top: string
  left: string
  delay: number
  duration: number
  animationType: 'float1' | 'float2'
}>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  top: ${props => props.top};
  left: ${props => props.left};
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.1) 0%,
    rgba(59, 130, 246, 0.05) 50%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(2px);
  ${props => css`
    animation: ${props.animationType === 'float1' ? float1 : float2} ${props.duration}s ease-in-out infinite ${props.delay}s;
  `}
`

const MovingGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    rgba(16, 185, 129, 0.02),
    rgba(59, 130, 246, 0.02),
    rgba(139, 92, 246, 0.02),
    rgba(16, 185, 129, 0.02)
  );
  background-size: 400% 400%;
  ${css`animation: ${moveGradient} 20s ease infinite;`}
`

const GeometricShape = styled.div<{
  size: number
  top: string
  left: string
  rotation: number
}>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  top: ${props => props.top};
  left: ${props => props.left};
  border: 1px solid rgba(16, 185, 129, 0.1);
  transform: rotate(${props => props.rotation}deg);
  
  &:nth-child(odd) {
    border-radius: 50%;
  }
  
  &:nth-child(even) {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }
`

export const AnimatedBackground: React.FC = () => {
  const orbs = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    size: Math.random() * 200 + 100,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 30,
    animationType: (i % 2 === 0 ? 'float1' : 'float2') as 'float1' | 'float2',
  }))

  const shapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    rotation: Math.random() * 360,
  }))

  return (
    <BackgroundContainer>
      <MovingGradient />
      {orbs.map(orb => (
        <GradientOrb
          key={orb.id}
          size={orb.size}
          top={orb.top}
          left={orb.left}
          delay={orb.delay}
          duration={orb.duration}
          animationType={orb.animationType}
        />
      ))}
      {shapes.map(shape => (
        <GeometricShape
          key={shape.id}
          size={shape.size}
          top={shape.top}
          left={shape.left}
          rotation={shape.rotation}
        />
      ))}
    </BackgroundContainer>
  )
}