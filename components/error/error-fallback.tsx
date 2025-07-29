'use client'

import { VStack, HStack, ActionButton, Card } from '@/components/ui'
import type { ErrorInfo } from './error-boundary'

interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  errorId: string | null
  level: 'page' | 'section' | 'component'
  onRetry: () => void
  onRefresh: () => void
  onGoBack: () => void
  isolate?: boolean
}

export function ErrorFallback({
  error,
  errorInfo,
  errorId,
  level,
  onRetry,
  onRefresh,
  onGoBack,
  isolate = false
}: ErrorFallbackProps) {
  
  // Determine error severity and messaging based on level
  const getErrorConfig = () => {
    switch (level) {
      case 'page':
        return {
          title: 'Page Error',
          description: 'Something went wrong while loading this page.',
          icon: '🚨',
          showRefresh: true,
          showGoBack: true,
          showRetry: false,
          severity: 'high' as const
        }
      case 'section':
        return {
          title: 'Section Error',
          description: 'This section encountered an error and couldn\'t load properly.',
          icon: '⚠️',
          showRefresh: false,
          showGoBack: false,
          showRetry: true,
          severity: 'medium' as const
        }
      case 'component':
      default:
        return {
          title: 'Component Error',
          description: 'A component on this page encountered an error.',
          icon: '🔧',
          showRefresh: false,
          showGoBack: false,
          showRetry: true,
          severity: 'low' as const
        }
    }
  }

  const config = getErrorConfig()

  // Determine container styling based on level and isolation
  const getContainerStyles = () => {
    if (isolate || level === 'component') {
      return 'border border-red-200 bg-red-50 rounded-lg p-4'
    }
    if (level === 'section') {
      return 'border border-red-200 bg-red-50 rounded-lg p-6 my-4'
    }
    // Page level - full page error
    return 'min-h-[400px] flex items-center justify-center p-8'
  }

  // Get user-friendly error message
  const getUserMessage = () => {
    // Common error patterns and their user-friendly messages
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.'
    }
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return 'Your session has expired. Please sign in again.'
    }
    if (error.message.includes('Forbidden') || error.message.includes('403')) {
      return 'You don\'t have permission to access this resource.'
    }
    if (error.message.includes('Not Found') || error.message.includes('404')) {
      return 'The requested resource could not be found.'
    }
    if (error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.'
    }
    
    // Generic fallback
    return config.description
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className={getContainerStyles()}>
      <div className="text-center max-w-md mx-auto">
        <VStack spacing="lg">
          {/* Error Icon and Title */}
          <div>
            <div className="text-4xl mb-2">{config.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {config.title}
            </h2>
            <p className="text-gray-600">
              {getUserMessage()}
            </p>
          </div>

          {/* Development Error Details */}
          {isDevelopment && (
            <Card className="text-left bg-gray-50 border-gray-200">
              <VStack spacing="sm">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">Error Details</h3>
                  <p className="text-xs text-red-600 font-mono break-all">
                    {error.name}: {error.message}
                  </p>
                </div>
                
                {errorId && (
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">Error ID</h3>
                    <p className="text-xs text-gray-600 font-mono">
                      {errorId}
                    </p>
                  </div>
                )}

                {error.stack && (
                  <details className="w-full">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </details>
                )}

                {errorInfo?.componentStack && (
                  <details className="w-full">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      Component Stack
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </VStack>
            </Card>
          )}

          {/* Action Buttons */}
          <VStack spacing="sm" className="w-full">
            {config.showRetry && (
              <ActionButton
                onClick={onRetry}
                variant="primary"
                className="w-full"
              >
                Try Again
              </ActionButton>
            )}
            
            {config.showRefresh && (
              <ActionButton
                onClick={onRefresh}
                variant="primary"
                className="w-full"
              >
                Refresh Page
              </ActionButton>
            )}
            
            {config.showGoBack && (
              <ActionButton
                onClick={onGoBack}
                variant="secondary"
                className="w-full"
              >
                Go Back
              </ActionButton>
            )}

            {/* Contact Support Link for High Severity Errors */}
            {config.severity === 'high' && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  If this problem persists, please contact support.
                </p>
                {errorId && (
                  <p className="text-xs text-gray-500">
                    Reference ID: <span className="font-mono">{errorId}</span>
                  </p>
                )}
              </div>
            )}
          </VStack>
        </VStack>
      </div>
    </div>
  )
}

// Lightweight error fallback for minimal components
export function MinimalErrorFallback({ 
  error, 
  onRetry 
}: { 
  error: Error
  onRetry: () => void 
}) {
  return (
    <div className="p-3 border border-red-200 bg-red-50 rounded text-center">
      <p className="text-sm text-red-700 mb-2">⚠️ Something went wrong</p>
      <ActionButton onClick={onRetry} size="sm" variant="secondary">
        Retry
      </ActionButton>
    </div>
  )
}

// Inline error fallback for form fields or small components
export function InlineErrorFallback({ 
  error, 
  onRetry 
}: { 
  error: Error
  onRetry: () => void 
}) {
  return (
    <div className="flex items-center justify-between p-2 border border-red-200 bg-red-50 rounded text-sm">
      <span className="text-red-700">⚠️ Error loading</span>
      <button 
        onClick={onRetry}
        className="text-red-600 hover:text-red-800 underline"
      >
        Retry
      </button>
    </div>
  )
}