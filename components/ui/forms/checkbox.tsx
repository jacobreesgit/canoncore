'use client'

import { forwardRef } from 'react'
import { LoadingSpinner } from '../base/loading'

export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: CheckboxSize
  label?: string
  description?: string
  error?: string
  helpText?: string
  indeterminate?: boolean
  isLoading?: boolean
}

const sizeStyles: Record<CheckboxSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4', 
  lg: 'h-5 w-5'
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    size = 'md',
    label,
    description,
    error,
    helpText,
    indeterminate = false,
    isLoading = false,
    disabled,
    className = '',
    id,
    ...props 
  }, ref) => {
    // Generate ID if not provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    
    // Build checkbox className
    const baseStyles = 'text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 transition-colors'
    const errorStyles = error ? 'border-red-300 focus:ring-red-500' : ''
    const disabledStyles = (disabled || isLoading) ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer'
    const sizeClass = sizeStyles[size]
    
    const checkboxClassName = `${baseStyles} ${errorStyles} ${disabledStyles} ${sizeClass} ${className}`
    
    return (
      <div className="space-y-1">
        {/* Checkbox Container */}
        <div className="flex items-start space-x-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled || isLoading}
              className={checkboxClassName}
              {...props}
            />
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
            
            {/* Indeterminate Indicator */}
            {indeterminate && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-2 w-2 bg-blue-600 rounded-sm"></div>
              </div>
            )}
          </div>
          
          {/* Label and Description Container */}
          {(label || description) && (
            <div className="flex-1 min-w-0">
              {label && (
                <label 
                  htmlFor={checkboxId} 
                  className={`block text-sm font-medium ${
                    error ? 'text-red-700' : 'text-gray-700'
                  } ${disabled || isLoading ? 'text-gray-400' : 'cursor-pointer'}`}
                >
                  {label}
                </label>
              )}
              {description && (
                <p className={`text-xs mt-1 ${
                  error ? 'text-red-600' : 'text-gray-500'
                } ${disabled || isLoading ? 'text-gray-400' : ''}`}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Help Text */}
        {helpText && !error && !description && (
          <p className="text-sm text-gray-500 ml-7">{helpText}</p>
        )}
        
        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 ml-7">{error}</p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'