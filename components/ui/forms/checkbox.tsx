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
    isLoading = false,
    disabled,
    className = '',
    id,
    ...props 
  }, ref) => {
    // Generate ID if not provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    
    // Build checkbox className
    const baseStyles = 'text-blue-600 border-gray-300 rounded focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-0 transition-colors'
    const errorStyles = error ? 'border-red-300 focus-visible:ring-red-500' : ''
    const disabledStyles = (disabled || isLoading) ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer'
    const sizeClass = sizeStyles[size]
    
    const checkboxClassName = `${baseStyles} ${errorStyles} ${disabledStyles} ${sizeClass} ${className}`
    
    return (
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center">
          {!isLoading && (
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled || isLoading}
              className={checkboxClassName}
              {...props}
            />
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className={`flex items-center justify-center ${sizeClass}`}>
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        
        {/* All Text Content Container */}
        <label htmlFor={checkboxId} className="flex-1 min-w-0 cursor-pointer space-y-1">
          {/* Label and Description Container */}
          {(label || description) && (
            <div>
              {label && (
                <span className={`block text-sm font-medium ${
                  error ? 'text-red-700' : 'text-gray-700'
                } ${disabled || isLoading ? 'text-gray-400' : ''}`}>
                  {label}
                </span>
              )}
              {description && (
                <span className={`text-xs mt-1 block ${
                  error ? 'text-red-600' : 'text-gray-500'
                } ${disabled || isLoading ? 'text-gray-400' : ''}`}>
                  {description}
                </span>
              )}
            </div>
          )}
          
          {/* Help Text */}
          {helpText && !error && !description && (
            <p className="text-sm text-gray-500">{helpText}</p>
          )}
          
          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </label>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'