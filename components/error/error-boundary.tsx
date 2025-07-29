'use client'

import React, { Component, ReactNode } from 'react'
import { ErrorFallback } from './error-fallback'

interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  errorBoundaryStack?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
  isolate?: boolean
  level?: 'page' | 'section' | 'component'
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props
    const { errorId } = this.state

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error [${errorId}]`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (onError && errorId) {
      try {
        onError(error, errorInfo, errorId)
      } catch (handlerError) {
        console.error('Error in error boundary handler:', handlerError)
      }
    }

    // In production, you might want to send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error monitoring service
      // errorReportingService.reportError({
      //   error,
      //   errorInfo,
      //   errorId,
      //   level: this.props.level || 'component',
      //   url: window.location.href,
      //   userAgent: navigator.userAgent,
      //   timestamp: new Date().toISOString()
      // })
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    // Auto-reset on props change if enabled
    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        // Reset if any of the reset keys changed
        const hasResetKeyChanged = resetKeys.some(
          (key, idx) => prevProps.resetKeys?.[idx] !== key
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId } = this.state
    const { children, fallback, level = 'component', isolate = false } = this.props

    if (hasError && error) {
      // If custom fallback is provided, use it
      if (fallback) {
        return fallback
      }

      // Use default error fallback
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          level={level}
          onRetry={this.handleRetry}
          onRefresh={this.handleRefresh}
          onGoBack={this.handleGoBack}
          isolate={isolate}
        />
      )
    }

    return children
  }
}

// Higher-order component wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Utility function to create error boundary with default props
export function createErrorBoundary(props?: Partial<ErrorBoundaryProps>) {
  const BoundaryWrapper = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary {...props}>
      {children}
    </ErrorBoundary>
  )
  
  BoundaryWrapper.displayName = 'BoundaryWrapper'
  return BoundaryWrapper
}

// Export types for use in other components
export type { ErrorBoundaryProps, ErrorInfo }