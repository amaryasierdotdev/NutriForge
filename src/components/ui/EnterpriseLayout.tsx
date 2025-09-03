import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useEnterpriseFeatures } from '../../hooks/useEnterpriseFeatures'

interface Props {
  children: React.ReactNode
  isDarkMode: boolean
  onThemeToggle: () => void
}

const LayoutContainer = styled.div<{ isDarkMode: boolean }>`
  min-height: 100vh;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)'};
  color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
  display: grid;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  grid-template-columns: 280px 1fr;
  grid-template-rows: 80px 1fr;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: 80px 1fr;
  }
`

const Sidebar = styled(motion.aside)<{ isDarkMode: boolean; isCollapsed: boolean }>`
  grid-area: sidebar;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)'
      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border-right: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)'};
  backdrop-filter: blur(24px);
  padding: 24px 0;
  width: ${props => props.isCollapsed ? '80px' : '280px'};
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;

  @media (max-width: 1024px) {
    display: none;
  }
`

const Header = styled.header<{ isDarkMode: boolean }>`
  grid-area: header;
  background: ${props =>
    props.isDarkMode
      ? 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)'
      : 'linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border-bottom: 1px solid ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.08)'};
  backdrop-filter: blur(24px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 99;
`

const MainContent = styled.main<{ isDarkMode: boolean }>`
  grid-area: main;
  padding: 32px;
  overflow-y: auto;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props =>
      props.isDarkMode
        ? 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)'
        : 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.02) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.02) 0%, transparent 60%)'};
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`

const Logo = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  margin-bottom: 32px;

  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    font-weight: 700;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`

const NavSection = styled.div`
  margin-bottom: 32px;
`

const NavTitle = styled.h3<{ isDarkMode: boolean }>`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.isDarkMode ? '#64748b' : '#64748b'};
  margin: 0 24px 12px;
`

const NavItem = styled(motion.button)<{ isDarkMode: boolean; isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border: none;
  background: ${props =>
    props.isActive
      ? props.isDarkMode
        ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)'
        : 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
      : 'transparent'};
  color: ${props =>
    props.isActive
      ? '#3b82f6'
      : props.isDarkMode
        ? '#cbd5e1'
        : '#475569'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid ${props => props.isActive ? '#3b82f6' : 'transparent'};
  text-align: left;

  &:hover {
    background: ${props =>
      props.isDarkMode
        ? 'rgba(59, 130, 246, 0.08)'
        : 'rgba(59, 130, 246, 0.05)'};
    color: #3b82f6;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const HeaderTitle = styled.h1<{ isDarkMode: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
  margin: 0;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const ActionButton = styled.button<{ isDarkMode: boolean; variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  ` : `
    background: ${props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.05)'};
    color: ${props.isDarkMode ? '#cbd5e1' : '#475569'};
    border: 1px solid ${props.isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.1)'};
    
    &:hover {
      background: ${props.isDarkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(15, 23, 42, 0.08)'};
    }
  `}
`

const UserProfile = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: ${props =>
    props.isDarkMode ? 'rgba(148, 163, 184, 0.05)' : 'rgba(15, 23, 42, 0.03)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props =>
      props.isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.05)'};
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
  }

  .user-info {
    .name {
      font-size: 14px;
      font-weight: 600;
      color: ${props => props.isDarkMode ? '#f8fafc' : '#0f172a'};
    }
    .role {
      font-size: 12px;
      color: ${props => props.isDarkMode ? '#64748b' : '#64748b'};
    }
  }
`

export const EnterpriseLayout: React.FC<Props> = ({ children, isDarkMode, onThemeToggle }) => {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  useEnterpriseFeatures()

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'main' },
    { id: 'calculator', label: 'Calculator', icon: '🧮', section: 'main' },
    { id: 'reports', label: 'Reports', icon: '📈', section: 'main' },
    { id: 'clients', label: 'Clients', icon: '👥', section: 'main' },
    { id: 'integrations', label: 'Integrations', icon: '🔗', section: 'tools' },
    { id: 'analytics', label: 'Analytics', icon: '📊', section: 'tools' },
    { id: 'settings', label: 'Settings', icon: '⚙️', section: 'admin' },
    { id: 'compliance', label: 'Compliance', icon: '🛡️', section: 'admin' },
  ]

  const groupedNav = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, typeof navigationItems>)

  return (
    <LayoutContainer isDarkMode={isDarkMode}>
      <Sidebar 
        isDarkMode={isDarkMode} 
        isCollapsed={sidebarCollapsed}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Logo isDarkMode={isDarkMode}>
          <div className="logo-icon">N</div>
          {!sidebarCollapsed && <div className="logo-text">NutriForge Pro</div>}
        </Logo>

        {Object.entries(groupedNav).map(([section, items]) => (
          <NavSection key={section}>
            {!sidebarCollapsed && (
              <NavTitle isDarkMode={isDarkMode}>
                {section === 'main' ? 'Main' : section === 'tools' ? 'Tools' : 'Administration'}
              </NavTitle>
            )}
            {items.map(item => (
              <NavItem
                key={item.id}
                isDarkMode={isDarkMode}
                isActive={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && item.label}
              </NavItem>
            ))}
          </NavSection>
        ))}

        {!sidebarCollapsed && (
          <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
            <UserProfile isDarkMode={isDarkMode}>
              <div className="avatar">JD</div>
              <div className="user-info">
                <div className="name">John Doe</div>
                <div className="role">Nutritionist</div>
              </div>
            </UserProfile>
          </div>
        )}
      </Sidebar>

      <Header isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ActionButton
            isDarkMode={isDarkMode}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </ActionButton>
          <HeaderTitle isDarkMode={isDarkMode}>
            {navigationItems.find(item => item.id === activeNav)?.label || 'Dashboard'}
          </HeaderTitle>
        </div>

        <HeaderActions>
          <ActionButton isDarkMode={isDarkMode}>
            🔔
          </ActionButton>
          <ActionButton isDarkMode={isDarkMode}>
            ❓
          </ActionButton>
          <ActionButton isDarkMode={isDarkMode} onClick={onThemeToggle}>
            {isDarkMode ? '☀️' : '🌙'}
          </ActionButton>
          <ActionButton isDarkMode={isDarkMode} variant="primary">
            + New Calculation
          </ActionButton>
        </HeaderActions>
      </Header>

      <MainContent isDarkMode={isDarkMode}>
        {children}
      </MainContent>
    </LayoutContainer>
  )
}