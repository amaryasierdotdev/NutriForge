import React, { Component, ErrorInfo, ReactNode } from 'react'
import styled from 'styled-components'
import { EnterpriseLogger } from '../services/EnterpriseLogger'
import { I18nService } from '../services/i18n'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #000000 100%);
  color: #ffffff;
  padding: 40px;
`

const ErrorCard = styled.div`
  background: linear-gradient(145deg, rgba(15, 15, 15, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 24px;
  padding: 48px;
  max-width: 600px;
  text-align: center;
  backdrop-filter: blur(32px);
  box-shadow: 0 32px 64px -12px rgba(239, 68, 68, 0.2);
`

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`

const ErrorTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ef4444;
`

const ErrorMessage = styled.p`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
  color: #d1d5db;
`

const ErrorActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.primary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #d1d5db;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
`

const ErrorDetails = styled.details`
  margin-top: 24px;
  text-align: left;
  
  summary {
    cursor: pointer;
    color: #9ca3af;
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 16px;
    border-radius: 8px;
    font-size: 12px;
    overflow-x: auto;
    color: #fca5a5;
  }
`

export class ErrorBoundary extends Component<Props, State> {
  private logger = EnterpriseLogger.getInstance()

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logger.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'App'
    })

    this.setState({
      error,
      errorInfo
    })

    // Report to external error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Integration point for services like Sentry, Bugsnag, etc.
    console.error('Error reported to monitoring service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      sessionId: this.logger.getSessionId(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  private handleReload = () => {
    this.logger.trackUserAction('error_reload', 'ErrorBoundary')
    window.location.reload()
  }

  private handleReset = () => {
    this.logger.trackUserAction('error_reset', 'ErrorBoundary')
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReportIssue = () => {
    this.logger.trackUserAction('error_report', 'ErrorBoundary')
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      sessionId: this.logger.getSessionId(),
      logs: this.logger.getLogs(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert(I18nService.t('supplements.errorReported')))
      .catch(() => console.log('Error report:', errorReport))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorIcon>🚨</ErrorIcon>
            <ErrorTitle>{I18nService.t('supplements.applicationError')}</ErrorTitle>
            <ErrorMessage>
              {I18nService.t('supplements.somethingWentWrong')}
            </ErrorMessage>
            
            <ErrorActions>
              <ActionButton className="primary" onClick={this.handleReload}>
                {I18nService.t('supplements.reloadApplication')}
              </ActionButton>
              <ActionButton className="secondary" onClick={this.handleReset}>
                {I18nService.t('supplements.tryAgain')}
              </ActionButton>
              <ActionButton className="secondary" onClick={this.handleReportIssue}>
                {I18nService.t('supplements.reportIssue')}
              </ActionButton>
            </ErrorActions>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <ErrorDetails>
                <summary>{I18nService.t('supplements.errorDetails')}</summary>
                <pre>
                  <strong>Error:</strong> {this.state.error.message}
                  {'\n\n'}
                  <strong>Stack:</strong>
                  {'\n'}
                  {this.state.error.stack}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong>
                      {'\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </ErrorDetails>
            )}
          </ErrorCard>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}