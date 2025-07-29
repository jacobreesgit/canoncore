'use client'

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { LoadingSpinner } from '../base/loading'

export type TextareaSize = 'sm' | 'md' | 'lg'
export type ResizeMode = 'none' | 'vertical' | 'both'

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: TextareaSize
  label?: string
  error?: string
  helpText?: string
  isLoading?: boolean
  autoResize?: boolean
  showCharCount?: boolean
  minRows?: number
  maxRows?: number
  resize?: ResizeMode
}

const sizeStyles: Record<TextareaSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

const resizeStyles: Record<ResizeMode, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    size = 'md',
    label,
    error,
    helpText,
    isLoading = false,
    autoResize = false,
    showCharCount = false,
    minRows = 3,
    maxRows,
    resize = 'none',
    disabled,
    className = '',
    id,
    value,
    maxLength,
    onChange,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const combinedRef = ref || textareaRef
    
    // Generate ID if not provided
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    // Auto-resize functionality
    const adjustHeight = useCallback(() => {
      const textarea = typeof combinedRef === 'function' ? textareaRef.current : combinedRef?.current
      if (!textarea || !autoResize) return
      
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      
      // Calculate the height based on content
      const scrollHeight = textarea.scrollHeight
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
      const minHeight = lineHeight * minRows
      const maxHeight = maxRows ? lineHeight * maxRows : Infinity
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }, [autoResize, minRows, maxRows, combinedRef])
    
    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      
      if (onChange) {
        onChange(e)
      }
      
      // Trigger auto-resize on next tick
      if (autoResize) {
        setTimeout(adjustHeight, 0)
      }
    }
    
    // Update internal value when external value changes
    useEffect(() => {
      setInternalValue(value || '')
    }, [value])
    
    // Initial auto-resize
    useEffect(() => {
      if (autoResize) {
        adjustHeight()
      }
    }, [adjustHeight, autoResize])
    
    // Build textarea className
    const baseStyles = 'w-full border rounded-md shadow-sm transition-colors focus:outline-none focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white text-gray-900'
    const errorStyles = error ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500' : 'border-gray-300'
    const disabledStyles = (disabled || isLoading) ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
    const paddingStyles = sizeStyles[size]
    const resizeClass = autoResize ? 'resize-none' : resizeStyles[resize]
    
    const textareaClassName = `${baseStyles} ${errorStyles} ${disabledStyles} ${paddingStyles} ${resizeClass} ${className}`
    
    // Calculate character count
    const currentLength = typeof internalValue === 'string' ? internalValue.length : 0
    const showCount = showCharCount || (maxLength && maxLength > 0)
    
    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={combinedRef}
            id={textareaId}
            value={internalValue}
            onChange={handleChange}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            rows={autoResize ? minRows : (props.rows || minRows)}
            className={textareaClassName}
            {...props}
          />
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute top-2 right-2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        
        {/* Character Count */}
        {showCount && (
          <div className="flex justify-end">
            <span className={`text-xs ${
              maxLength && currentLength > maxLength ? 'text-red-600' : 'text-gray-500'
            }`}>
              {currentLength}{maxLength ? `/${maxLength}` : ''} characters
            </span>
          </div>
        )}
        
        {/* Help Text */}
        {helpText && !error && (
          <p className="text-xs text-gray-500">{helpText}</p>
        )}
        
        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'