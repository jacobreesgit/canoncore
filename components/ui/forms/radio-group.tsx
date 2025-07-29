'use client'

import { forwardRef, useId } from 'react'
import { LoadingSpinner } from '../base/loading'

export type RadioGroupSize = 'sm' | 'md' | 'lg'
export type RadioGroupLayout = 'vertical' | 'horizontal'

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  size?: RadioGroupSize
  layout?: RadioGroupLayout
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  isLoading?: boolean
}

const sizeStyles: Record<RadioGroupSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    name,
    options,
    value,
    defaultValue,
    onChange,
    size = 'md',
    layout = 'vertical',
    label,
    error,
    helpText,
    required = false,
    disabled = false,
    isLoading = false,
    ...props 
  }, ref) => {
    const groupId = useId()
    const labelId = `${groupId}-label`
    const helpTextId = `${groupId}-help`
    const errorId = `${groupId}-error`
    
    // Handle option change
    const handleChange = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue)
      }
    }
    
    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
      const enabledOptions = options.filter(option => !option.disabled && !disabled)
      const currentEnabledIndex = enabledOptions.findIndex(opt => opt.value === options[currentIndex].value)
      
      let nextIndex = currentEnabledIndex
      
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = (currentEnabledIndex + 1) % enabledOptions.length
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = currentEnabledIndex === 0 ? enabledOptions.length - 1 : currentEnabledIndex - 1
          break
        default:
          return
      }
      
      const nextOption = enabledOptions[nextIndex]
      if (nextOption) {
        handleChange(nextOption.value)
        // Focus the next radio button
        const nextRadio = document.getElementById(`${groupId}-${nextOption.value}`)
        nextRadio?.focus()
      }
    }
    
    // Build radio button className
    const radioBaseStyles = 'text-blue-600 border-gray-300 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:ring-offset-0 transition-colors'
    const radioErrorStyles = error ? 'border-red-300 focus-visible:ring-red-500' : ''
    const radioDisabledStyles = 'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
    const radioSizeClass = sizeStyles[size]
    
    const radioClassName = `${radioBaseStyles} ${radioErrorStyles} ${radioDisabledStyles} ${radioSizeClass}`
    
    // Layout styles
    const containerLayout = layout === 'horizontal' ? 'flex flex-wrap gap-x-6 gap-y-2' : 'space-y-3'
    
    return (
      <div ref={ref} className="space-y-2" {...props}>
        {/* Label */}
        {label && (
          <label 
            id={labelId}
            className={`block text-sm font-medium ${
              error ? 'text-red-700' : 'text-gray-700'
            } ${disabled || isLoading ? 'text-gray-400' : ''}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Radio Options */}
        <div 
          className={containerLayout}
          role="radiogroup"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={helpText ? helpTextId : error ? errorId : undefined}
          aria-required={required}
          aria-invalid={!!error}
        >
          {options.map((option, index) => {
            const optionId = `${groupId}-${option.value}`
            const isChecked = value !== undefined ? value === option.value : defaultValue === option.value
            const isOptionDisabled = option.disabled || disabled || isLoading
            
            return (
              <div key={option.value} className="flex items-center space-x-3">
                <div className="relative flex items-center">
                  <input
                    id={optionId}
                    name={name}
                    type="radio"
                    value={option.value}
                    checked={isChecked}
                    disabled={isOptionDisabled}
                    onChange={() => handleChange(option.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`${radioClassName} ${isOptionDisabled ? '' : 'cursor-pointer'}`}
                    aria-describedby={option.description ? `${optionId}-desc` : undefined}
                  />
                  
                  {/* Loading Indicator */}
                  {isLoading && isChecked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                
                {/* Option Label and Description Container - All Clickable */}
                <label 
                  htmlFor={optionId}
                  className={`flex-1 min-w-0 space-y-1 ${isOptionDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div>
                    <span className={`block text-sm font-medium ${
                      error ? 'text-red-700' : 'text-gray-700'
                    } ${isOptionDisabled ? 'text-gray-400' : ''}`}>
                      {option.label}
                    </span>
                    {option.description && (
                      <span 
                        id={`${optionId}-desc`}
                        className={`text-xs mt-1 block ${
                          error ? 'text-red-600' : 'text-gray-500'
                        } ${isOptionDisabled ? 'text-gray-400' : ''}`}
                      >
                        {option.description}
                      </span>
                    )}
                  </div>
                </label>
              </div>
            )
          })}
        </div>
        
        {/* Help Text */}
        {helpText && !error && (
          <p id={helpTextId} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
        
        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'