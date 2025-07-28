'use client'

import { ReactNode, Suspense, ComponentType } from 'react'
import { LoadingCard, LoadingPlaceholder, LoadingSpinner } from '../base/loading'
import { Card } from '../base/card'

export type LoadingFallbackType = 'card' | 'placeholder' | 'spinner' | 'custom'

export interface LoadingWrapperProps {
  isLoading: boolean
  children: ReactNode
  fallback?: LoadingFallbackType
  fallbackComponent?: ComponentType<any>
  fallbackProps?: Record<string, any>
  error?: Error | null
  onRetry?: () => void
  className?: string
  // Card-specific props
  showTitle?: boolean
  lines?: number
  // Placeholder-specific props
  title?: string
  message?: string
  // Wrapper options
  wrapInCard?: boolean
  animate?: boolean
}

interface LoadingErrorProps {
  error: Error
  onRetry?: () => void
}

function LoadingError({ error, onRetry }: LoadingErrorProps) {
  return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-4">
        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export function LoadingWrapper({
  isLoading,
  children,
  fallback = 'card',
  fallbackComponent: CustomFallback,
  fallbackProps = {},
  error,
  onRetry,
  className = '',
  // Card props
  showTitle = true,
  lines = 2,
  // Placeholder props
  title = 'Loading...',
  message,
  // Options
  wrapInCard = false,
  animate = true
}: LoadingWrapperProps) {
  
  // Error state
  if (error) {
    const errorContent = <LoadingError error={error} onRetry={onRetry} />
    return wrapInCard ? <Card>{errorContent}</Card> : errorContent
  }

  // Loading state
  if (isLoading) {
    let loadingContent: ReactNode

    if (CustomFallback) {
      loadingContent = <CustomFallback {...fallbackProps} />
    } else {
      switch (fallback) {
        case 'card':
          loadingContent = (
            <LoadingCard 
              showTitle={showTitle} 
              lines={lines} 
              className={animate ? '' : '!animate-none'}
              {...fallbackProps}
            />
          )
          break
          
        case 'placeholder':
          loadingContent = (
            <LoadingPlaceholder 
              title={title} 
              message={message}
              className={animate ? '' : '!animate-none'}
              {...fallbackProps}
            />
          )
          break
          
        case 'spinner':
          loadingContent = (
            <div className="flex justify-center py-8">
              <LoadingSpinner 
                size="lg" 
                className={`text-blue-600 ${animate ? '' : '!animate-none'}`}
                {...fallbackProps}
              />
            </div>
          )
          break
          
        default:
          loadingContent = (
            <LoadingCard 
              showTitle={showTitle} 
              lines={lines}
              className={animate ? '' : '!animate-none'}
              {...fallbackProps}
            />
          )
      }
    }

    const wrappedContent = wrapInCard ? <Card>{loadingContent}</Card> : loadingContent
    return <div className={className}>{wrappedContent}</div>
  }

  // Success state - show children
  return (
    <div className={`${animate ? 'transition-opacity duration-200' : ''} ${className}`}>
      {children}
    </div>
  )
}

// Convenience hooks for common patterns
export function useLoadingWrapper(isLoading: boolean, error?: Error | null) {
  return {
    isLoading,
    error,
    wrap: (children: ReactNode, props?: Partial<LoadingWrapperProps>) => (
      <LoadingWrapper 
        isLoading={isLoading} 
        error={error}
        {...props}
      >
        {children}
      </LoadingWrapper>
    )
  }
}

// Higher-order component for wrapping entire components
export function withLoadingWrapper<P extends object>(
  Component: ComponentType<P>,
  defaultProps?: Partial<LoadingWrapperProps>
) {
  const WrappedComponent = (props: P & { isLoading?: boolean; error?: Error | null }) => {
    const { isLoading = false, error = null, ...componentProps } = props
    
    return (
      <LoadingWrapper 
        isLoading={isLoading} 
        error={error}
        {...defaultProps}
      >
        <Component {...(componentProps as P)} />
      </LoadingWrapper>
    )
  }
  
  WrappedComponent.displayName = `withLoadingWrapper(${Component.displayName || Component.name})`
  return WrappedComponent
}