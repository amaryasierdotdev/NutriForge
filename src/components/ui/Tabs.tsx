import React, { useState } from 'react'
import styled from 'styled-components'

const TabsContainer = styled.div`
  width: 100%;
`

const TabsList = styled.div<{ isDarkMode?: boolean }>`
  display: flex;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, rgba(15, 15, 15, 0.8) 0%, rgba(9, 9, 11, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
  };
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 32px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(16px);
  box-shadow: ${props => props.isDarkMode
    ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };
  overflow-x: auto;
  gap: 6px;
  
  &::-webkit-scrollbar {
    display: none;
  }
`

const TabButton = styled.button<{ active: boolean; isDarkMode?: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'transparent'
  };
  border: ${props => props.active ? '1px solid #10b981' : '1px solid transparent'};
  padding: 16px 28px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.active ? '#ffffff' : (props.isDarkMode ? '#9ca3af' : '#475569')};
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.active 
    ? '0 8px 24px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : 'none'
  };
  
  &:hover {
    transform: ${props => props.active ? 'translateY(-1px)' : 'translateY(-2px)'};
    color: ${props => props.active ? '#ffffff' : '#10b981'};
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
      : (props.isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)')
    };
    box-shadow: ${props => props.active 
      ? '0 12px 32px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
      : '0 4px 16px rgba(16, 185, 129, 0.1)'
    };
  }
`

const TabContent = styled.div`
  width: 100%;
  min-height: 200px;
  opacity: 1;
  transition: opacity 0.15s ease-out;
  
  &.fade-enter {
    opacity: 0;
  }
  
  &.fade-enter-active {
    opacity: 1;
  }
`

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  isDarkMode?: boolean
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, isDarkMode = true }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  
  const activeContent = tabs.find(tab => tab.id === activeTab)?.content
  
  return (
    <TabsContainer>
      <TabsList isDarkMode={isDarkMode}>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            isDarkMode={isDarkMode}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsList>
      <TabContent>
        {activeContent}
      </TabContent>
    </TabsContainer>
  )
}