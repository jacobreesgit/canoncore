'use client'

import { forwardRef, useState, ReactNode } from 'react'
import { EyeIcon, EyeOffIcon } from '@/components/ui'
import { LoadingSpinner } from '../base/loading'

export type InputType = 'text' | 'email' | 'url' | 'number' | 'password'
export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  type?: InputType
  size?: InputSize
  label?: string
  error?: string
  helpText?: string
  prefixIcon?: ReactNode
  suffixIcon?: ReactNode
  isLoading?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    type = 'text',
    size = 'md',
    label,
    error,
    helpText,
    prefixIcon,
    suffixIcon,
    isLoading = false,
    disabled,
    className = '',
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    
    // Generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate actual input type (handle password visibility)
    const actualType = type === 'password' ? (showPassword ? 'text' : 'password') : type
    
    // Calculate if we need padding for icons
    const hasPrefixIcon = !!prefixIcon
    const hasSuffixIcon = !!suffixIcon || type === 'password'
    
    // Build input className
    const baseStyles = 'w-full border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900'
    const errorStyles = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
    const disabledStyles = (disabled || isLoading) ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
    const paddingStyles = `${sizeStyles[size]} ${hasPrefixIcon ? 'pl-10' : ''} ${hasSuffixIcon ? 'pr-10' : ''}`
    
    const inputClassName = `${baseStyles} ${errorStyles} ${disabledStyles} ${paddingStyles} ${className}`
    
    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Prefix Icon */}
          {prefixIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {prefixIcon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            disabled={disabled || isLoading}
            className={inputClassName}
            {...props}
          />
          
          {/* Suffix Icon or Password Toggle */}
          {(suffixIcon || type === 'password') && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {type === 'password' ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  disabled={disabled || isLoading}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              ) : (
                <div className="pointer-events-none text-gray-400">
                  {suffixIcon}
                </div>
              )}
            </div>
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        
        {/* Help Text */}
        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
        
        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'