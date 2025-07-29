'use client'

import { VStack, ActionButton, HStack } from '@/components/ui'
import type { ErrorSeverity } from '@/hooks/use-form-error'

interface ErrorDisplayProps {
  // Error content
  error?: string
  errors?: string[]
  severity?: ErrorSeverity
  
  // Display options
  variant?: 'inline' | 'card' | 'banner' | 'toast-style'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  
  // Actions
  onRetry?: () => void
  onDismiss?: () => void
  retryText?: string
  dismissText?: string
  
  // Styling
  className?: string
  compact?: boolean
}

export function ErrorDisplay({
  error,
  errors,
  severity = 'error',
  variant = 'inline',
  size = 'md',
  showIcon = true,
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  dismissText = 'Dismiss',
  className = '',
  compact = false
}: ErrorDisplayProps) {
  // Don't render if no errors
  const hasError = error || (errors && errors.length > 0)
  if (!hasError) return null

  // Get error messages array
  const errorMessages = errors || (error ? [error] : [])

  // Get styling based on severity and variant
  const getSeverityStyles = () => {
    const baseStyles = {
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-400',
        iconSymbol: '⚠️'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200', 
        text: 'text-yellow-800',
        icon: 'text-yellow-400',
        iconSymbol: '⚠️'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800', 
        icon: 'text-blue-400',
        iconSymbol: 'ℹ️'
      }
    }
    return baseStyles[severity]
  }

  const getVariantStyles = () => {
    const styles = getSeverityStyles()
    
    switch (variant) {
      case 'card':
        return `${styles.bg} ${styles.border} border rounded-lg p-4`
      case 'banner':
        return `${styles.bg} ${styles.border} border-l-4 p-4`
      case 'toast-style':
        return `${styles.bg} ${styles.border} border rounded-md shadow-md p-3`
      case 'inline':
      default:
        return `${styles.bg} ${styles.border} border rounded-md p-3`
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-base'
      case 'md':
      default:
        return 'text-sm'
    }
  }

  const getSpacing = () => {
    if (compact) return 'xs'
    return size === 'lg' ? 'md' : 'sm'
  }

  const styles = getSeverityStyles()
  const containerClasses = `${getVariantStyles()} ${getSizeStyles()} ${className}`

  return (
    <div className={containerClasses}>
      <VStack spacing={getSpacing()}>
        {/* Error content */}
        <div className="flex items-start">
          {showIcon && (
            <div className={`${styles.icon} mr-2 mt-0.5 flex-shrink-0`}>
              {variant === 'banner' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <span className="text-lg">{styles.iconSymbol}</span>
              )}
            </div>
          )}
          
          <div className="flex-1">
            {errorMessages.length === 1 ? (
              <p className={`${styles.text} ${compact ? 'leading-tight' : ''}`}>
                {errorMessages[0]}
              </p>
            ) : (
              <div>
                {errorMessages.length > 1 && !compact && (
                  <p className={`${styles.text} font-medium mb-1`}>
                    Multiple errors occurred:
                  </p>
                )}
                <ul className={`${styles.text} ${errorMessages.length > 1 ? 'list-disc list-inside space-y-1' : ''}`}>
                  {errorMessages.map((msg, index) => (
                    <li key={index} className={compact ? 'leading-tight' : ''}>
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {(onRetry || onDismiss) && !compact && (
          <HStack spacing="sm" className="justify-end">
            {onDismiss && (
              <ActionButton
                onClick={onDismiss}
                variant="secondary"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                {dismissText}
              </ActionButton>
            )}
            {onRetry && (
              <ActionButton
                onClick={onRetry}
                variant="primary"
                size="sm"
              >
                {retryText}
              </ActionButton>
            )}
          </HStack>
        )}
      </VStack>
    </div>
  )
}

// Specialized error display components for common use cases

interface FieldErrorDisplayProps {
  error?: string
  field?: string
  className?: string
}

export function FieldErrorDisplay({ error, field, className = '' }: FieldErrorDisplayProps) {
  if (!error) return null
  
  return (
    <div className={`mt-1 ${className}`}>
      <ErrorDisplay
        error={error}
        severity="error"
        variant="inline"
        size="sm"
        showIcon={false}
        compact
        className="border-0 bg-transparent p-0 text-red-600"
      />
    </div>
  )
}

interface FormSummaryErrorProps {
  errors: string[]
  onRetry?: () => void
  onDismiss?: () => void
  title?: string
  className?: string
}

export function FormSummaryError({ 
  errors, 
  onRetry, 
  onDismiss, 
  title = 'Please fix the following errors:',
  className = ''
}: FormSummaryErrorProps) {
  if (!errors || errors.length === 0) return null

  return (
    <ErrorDisplay
      error={errors.length === 1 ? errors[0] : undefined}
      errors={errors.length > 1 ? errors : undefined}
      severity="error"
      variant="card"
      size="md"
      showIcon
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
    />
  )
}

interface InlineFieldErrorProps {
  error?: string
  className?: string
}

export function InlineFieldError({ error, className = '' }: InlineFieldErrorProps) {
  if (!error) return null
  
  return (
    <span className={`text-sm text-red-600 ${className}`}>
      {error}
    </span>
  )
}

interface ErrorBannerProps {
  error?: string
  errors?: string[]
  severity?: ErrorSeverity
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorBanner({ 
  error, 
  errors, 
  severity = 'error', 
  onRetry, 
  onDismiss,
  className = ''
}: ErrorBannerProps) {
  return (
    <ErrorDisplay
      error={error}
      errors={errors}
      severity={severity}
      variant="banner"
      size="md"
      showIcon
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
    />
  )
}

// Helper component for form validation state
interface ValidationStateProps {
  isValid: boolean
  error?: string
  success?: string
  children: React.ReactNode
  className?: string
}

export function ValidationState({ 
  isValid, 
  error, 
  success, 
  children, 
  className = '' 
}: ValidationStateProps) {
  return (
    <div className={className}>
      {children}
      {error && <FieldErrorDisplay error={error} />}
      {success && isValid && (
        <div className="mt-1">
          <ErrorDisplay
            error={success}
            severity="info"
            variant="inline"
            size="sm"
            showIcon={false}
            compact
            className="border-0 bg-transparent p-0 text-green-600"
          />
        </div>
      )}
    </div>
  )
}