'use client'

import { useCallback, useRef } from 'react'

// Custom error types for better error classification
export class AsyncError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'AsyncError'
    if (originalError?.stack) {
      this.stack = originalError.stack
    }
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number, public url?: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

interface ErrorBoundaryApi {
  /**
   * Throw an error that will be caught by the nearest error boundary
   */
  throwError: (error: Error | string) => never
  
  /**
   * Wrap an async function to automatically catch and rethrow errors to error boundary
   */
  captureAsyncError: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>
  
  /**
   * Handle errors from async operations and throw them to error boundary
   */
  handleAsyncError: (error: unknown, context?: string) => never
  
  /**
   * Show error in error boundary (alias for throwError)
   */
  showError: (error: Error | string) => never
  
  /**
   * Wrap a function to catch errors and send them to error boundary
   */
  withErrorBoundary: <T extends any[], R>(
    fn: (...args: T) => R,
    errorMessage?: string
  ) => (...args: T) => R
}

export function useErrorBoundary(): ErrorBoundaryApi {
  // Use a ref to store the error throwing function to avoid recreating it
  const throwErrorRef = useRef<((error: Error) => never) | null>(null)

  // Initialize the error throwing mechanism
  if (!throwErrorRef.current) {
    throwErrorRef.current = (error: Error) => {
      // This will be caught by the error boundary's componentDidCatch
      throw error
    }
  }

  const throwError = useCallback((error: Error | string): never => {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    
    // Add timestamp and context to error
    if (!errorObj.stack) {
      errorObj.stack = new Error().stack
    }
    
    throwErrorRef.current!(errorObj)
    throw errorObj // This ensures the function never returns
  }, [])

  const handleAsyncError = useCallback((error: unknown, context?: string): never => {
    let errorObj: Error

    if (error instanceof Error) {
      errorObj = error
    } else if (typeof error === 'string') {
      errorObj = new AsyncError(error)
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorObj = new AsyncError(String(error.message))
    } else {
      errorObj = new AsyncError('Unknown async error occurred')
    }

    // Add context if provided
    if (context) {
      errorObj.message = `${context}: ${errorObj.message}`
    }

    return throwError(errorObj)
  }, [throwError])

  const captureAsyncError = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args)
      } catch (error) {
        return handleAsyncError(error, `Async operation failed`)
      }
    }
  }, [handleAsyncError])

  const withErrorBoundary = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    errorMessage?: string
  ) => {
    return (...args: T): R => {
      try {
        return fn(...args)
      } catch (error) {
        const message = errorMessage || 'Function execution failed'
        if (error instanceof Error) {
          error.message = `${message}: ${error.message}`
          return throwError(error)
        } else {
          return throwError(new Error(`${message}: ${String(error)}`))
        }
      }
    }
  }, [throwError])

  return {
    throwError,
    captureAsyncError,
    handleAsyncError,
    showError: throwError, // Alias for better semantics
    withErrorBoundary
  }
}

// Utility functions for error creation
export const createAsyncError = (message: string, originalError?: Error) => 
  new AsyncError(message, originalError)

export const createValidationError = (message: string, field?: string) =>
  new ValidationError(message, field)

export const createNetworkError = (message: string, statusCode?: number, url?: string) =>
  new NetworkError(message, statusCode, url)

export const createAuthError = (message?: string) =>
  new AuthenticationError(message)

export const createAuthzError = (message?: string) =>
  new AuthorizationError(message)

// Helper function to determine error type and create appropriate error
export function classifyError(error: unknown, context?: string): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(context ? `${context}: ${error}` : error)
  }

  if (error && typeof error === 'object') {
    if ('status' in error || 'statusCode' in error) {
      const status = ('status' in error ? error.status : error.statusCode) as number
      const message = 'message' in error ? String(error.message) : 'Network error'
      
      if (status === 401) {
        return new AuthenticationError(message)
      }
      if (status === 403) {
        return new AuthorizationError(message)
      }
      if (status >= 400) {
        return new NetworkError(message, status)
      }
    }

    if ('message' in error) {
      return new Error(String(error.message))
    }
  }

  return new Error(context ? `${context}: Unknown error` : 'Unknown error occurred')
}

// Hook for enhanced error handling with classification
export function useEnhancedErrorBoundary() {
  const { throwError, captureAsyncError, handleAsyncError, withErrorBoundary } = useErrorBoundary()

  const throwClassifiedError = useCallback((error: unknown, context?: string) => {
    const classifiedError = classifyError(error, context)
    return throwError(classifiedError)
  }, [throwError])

  const captureAndClassifyAsyncError = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return captureAsyncError(async (...args: T) => {
      try {
        return await fn(...args)
      } catch (error) {
        throw classifyError(error, context)
      }
    })
  }, [captureAsyncError])

  return {
    throwError: throwClassifiedError,
    captureAsyncError: captureAndClassifyAsyncError,
    handleAsyncError,
    withErrorBoundary,
    // Error creation utilities
    createAsyncError,
    createValidationError,
    createNetworkError,
    createAuthError,
    createAuthzError
  }
}