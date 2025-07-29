'use client'

import { useState, useCallback, useMemo } from 'react'
import { useToast } from './use-toast'

// Common form error types
export interface FormFieldError {
  field: string
  message: string
  code?: string
}

export interface FormError {
  general?: string
  fields: Record<string, string>
  originalError?: any
}

// Error severity levels
export type ErrorSeverity = 'error' | 'warning' | 'info'

interface FormErrorState {
  hasError: boolean
  generalError?: string
  fieldErrors: Record<string, string>
  errorSeverity: ErrorSeverity
  originalError?: any
}

interface FormErrorConfig {
  showToast?: boolean
  toastTitle?: string
  logToConsole?: boolean
  fieldMappings?: Record<string, string>
  severity?: ErrorSeverity
}

interface UseFormErrorReturn {
  // State
  errorState: FormErrorState
  hasError: boolean
  hasFieldError: (field: string) => boolean
  getFieldError: (field: string) => string | undefined
  
  // Actions  
  setError: (error: unknown, config?: FormErrorConfig) => void
  setFieldError: (field: string, message: string) => void
  setGeneralError: (message: string, severity?: ErrorSeverity) => void
  clearError: () => void
  clearFieldError: (field: string) => void
  
  // Form integration
  handleSubmitError: (error: unknown, config?: FormErrorConfig) => void
  validateField: (field: string, value: any, validators: Array<(value: any) => string | undefined>) => boolean
  
  // Utilities
  getDisplayError: () => string | undefined
  isRetryable: () => boolean
}

export function useFormError(defaultConfig?: FormErrorConfig): UseFormErrorReturn {
  const [errorState, setErrorState] = useState<FormErrorState>({
    hasError: false,
    fieldErrors: {},
    errorSeverity: 'error'
  })
  
  const { showToast } = useToast()

  // Parse error from various sources (API responses, validation, etc.)
  const parseError = useCallback((error: unknown): FormError => {
    // Handle null/undefined
    if (!error) {
      return { fields: {} }
    }

    // Handle string errors
    if (typeof error === 'string') {
      return { general: error, fields: {} }
    }

    // Handle Error objects
    if (error instanceof Error) {
      return { general: error.message, fields: {}, originalError: error }
    }

    // Handle API error responses (common patterns)
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any

      // Supabase/PostgreSQL errors
      if (errorObj.message) {
        const parsedError: FormError = { 
          general: errorObj.message, 
          fields: {},
          originalError: error 
        }

        // Check for field-specific errors in details
        if (errorObj.details && typeof errorObj.details === 'string') {
          // Parse common validation error patterns
          const fieldMatch = errorObj.details.match(/column "([^"]+)"/)
          if (fieldMatch) {
            const field = fieldMatch[1]
            parsedError.fields[field] = errorObj.message
            delete parsedError.general
          }
        }

        // Handle constraint violations
        if (errorObj.code === '23505') { // Unique constraint violation
          parsedError.general = 'This value already exists. Please choose a different one.'
        } else if (errorObj.code === '23502') { // Not null constraint violation
          parsedError.general = 'Required field is missing.'
        } else if (errorObj.code === '23503') { // Foreign key constraint violation
          parsedError.general = 'Referenced item no longer exists.'
        }

        return parsedError
      }

      // Handle validation errors with field mapping
      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        const fields: Record<string, string> = {}
        errorObj.errors.forEach((err: any) => {
          if (err.field && err.message) {
            fields[err.field] = err.message
          }
        })
        return { fields, originalError: error }
      }

      // Handle field-specific errors object
      if (errorObj.fields && typeof errorObj.fields === 'object') {
        return { 
          general: errorObj.message, 
          fields: errorObj.fields,
          originalError: error 
        }
      }

      // Network/HTTP errors
      if (errorObj.status || errorObj.statusCode) {
        const status = errorObj.status || errorObj.statusCode
        let message = 'An error occurred'
        
        if (status === 400) message = 'Invalid data provided'
        else if (status === 401) message = 'Authentication required'
        else if (status === 403) message = 'Access denied'
        else if (status === 404) message = 'Resource not found'
        else if (status === 409) message = 'Data conflict occurred'
        else if (status === 422) message = 'Validation failed'
        else if (status >= 500) message = 'Server error occurred'

        return { general: message, fields: {}, originalError: error }
      }
    }

    // Fallback for unknown error types
    return { 
      general: 'An unexpected error occurred', 
      fields: {},
      originalError: error 
    }
  }, [])

  // Set error from various sources
  const setError = useCallback((error: unknown, config?: FormErrorConfig) => {
    const mergedConfig = { ...defaultConfig, ...config }
    const parsedError = parseError(error)
    
    // Log to console if enabled
    if (mergedConfig.logToConsole !== false) {
      console.error('Form error:', {
        parsedError,
        originalError: parsedError.originalError,
        config: mergedConfig
      })
    }

    // Update state
    setErrorState({
      hasError: true,
      generalError: parsedError.general,
      fieldErrors: { ...parsedError.fields },
      errorSeverity: mergedConfig.severity || 'error',
      originalError: parsedError.originalError
    })

    // Show toast if enabled
    if (mergedConfig.showToast) {
      const title = mergedConfig.toastTitle || 'Error'
      const message = parsedError.general || 'Please check the form and try again'
      showToast({
        title,
        message,
        variant: mergedConfig.severity || 'error'
      })
    }
  }, [defaultConfig, parseError, showToast])

  // Set field-specific error
  const setFieldError = useCallback((field: string, message: string) => {
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      fieldErrors: {
        ...prev.fieldErrors,
        [field]: message
      }
    }))
  }, [])

  // Set general error
  const setGeneralError = useCallback((message: string, severity: ErrorSeverity = 'error') => {
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      generalError: message,
      errorSeverity: severity
    }))
  }, [])

  // Clear all errors
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      fieldErrors: {},
      errorSeverity: 'error'
    })
  }, [])

  // Clear specific field error
  const clearFieldError = useCallback((field: string) => {
    setErrorState(prev => {
      const newFieldErrors = { ...prev.fieldErrors }
      delete newFieldErrors[field]
      
      return {
        ...prev,
        fieldErrors: newFieldErrors,
        hasError: !!prev.generalError || Object.keys(newFieldErrors).length > 0,
      }
    })
  }, [])

  // Handle form submission errors
  const handleSubmitError = useCallback((error: unknown, config?: FormErrorConfig) => {
    setError(error, {
      showToast: true,
      toastTitle: 'Submit Failed',
      ...config
    })
  }, [setError])

  // Validate field with multiple validators
  const validateField = useCallback((
    field: string, 
    value: any, 
    validators: Array<(value: any) => string | undefined>
  ): boolean => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) {
        setFieldError(field, error)
        return false
      }
    }
    clearFieldError(field)
    return true
  }, [setFieldError, clearFieldError])

  // Computed values
  const hasError = errorState.hasError
  const hasFieldError = useCallback((field: string) => !!errorState.fieldErrors[field], [errorState.fieldErrors])
  const getFieldError = useCallback((field: string) => errorState.fieldErrors[field], [errorState.fieldErrors])
  
  const getDisplayError = useCallback(() => {
    if (errorState.generalError) return errorState.generalError
    
    const fieldErrorMessages = Object.values(errorState.fieldErrors)
    if (fieldErrorMessages.length > 0) return fieldErrorMessages[0]
    
    return undefined
  }, [errorState])

  const isRetryable = useCallback(() => {
    // Determine if the error is retryable based on type
    if (!errorState.originalError) return true
    
    const error = errorState.originalError
    if (error?.status >= 400 && error?.status < 500) return false // Client errors
    if (error?.code === '23505') return false // Unique constraint
    
    return true
  }, [errorState])

  return {
    // State
    errorState,
    hasError,
    hasFieldError,
    getFieldError,
    
    // Actions
    setError,
    setFieldError,
    setGeneralError,
    clearError,
    clearFieldError,
    
    // Form integration
    handleSubmitError,
    validateField,
    
    // Utilities
    getDisplayError,
    isRetryable
  }
}

// Common field validators
export const fieldValidators = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required'
    }
    return undefined
  },
  
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address'
    }
    return undefined
  },
  
  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`
    }
    return undefined
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`
    }
    return undefined
  },
  
  url: (value: string) => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return 'Please enter a valid URL (starting with http:// or https://)'
    }
    return undefined
  },
  
  passwordStrength: (value: string) => {
    if (value && value.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, lowercase letter, and number'
    }
    return undefined
  },
  
  matchField: (otherValue: string, fieldName: string = 'password') => (value: string) => {
    if (value !== otherValue) {
      return `Must match ${fieldName}`
    }
    return undefined
  }
}