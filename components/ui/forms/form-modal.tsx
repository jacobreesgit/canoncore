'use client'

import { useState, ReactNode, useMemo } from 'react'
import { BaseModal } from './base-modal'
import { ActionButton } from '../base/action-button'
import { VStack, HStack } from '../layout/stack'
import { Input } from './input'
import { Textarea } from './textarea'
import { Checkbox } from './checkbox'
import { Select } from '../controls/select'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'url' | 'checkbox' | 'custom'
  placeholder?: string
  required?: boolean
  nullable?: boolean // For text/textarea fields that should convert empty strings to null
  description?: string // Additional help text for the field
  defaultValue?: any // Default value for the field
  validate?: (value: any) => string | null // Validation function
  options?: Array<{ value: string; label: string }>
  rows?: number
  customInput?: ReactNode
  customComponent?: (value: any, onChange: (value: any) => void, error?: string) => ReactNode
}

interface FormModalProps<T = Record<string, any>> {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: FormField[]
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  submitText?: string
  submitColor?: 'success' | 'primary' | 'warning'
  isLoading?: boolean
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  deleteAction?: {
    text: string
    onDelete: () => Promise<void>
    isDeleting?: boolean
  }
  extraActions?: ReactNode
  disableSubmitWhenUnchanged?: boolean
}

export function FormModal<T = Record<string, any>>({
  isOpen,
  onClose,
  title,
  fields,
  initialData = {},
  onSubmit,
  submitText = 'Save',
  submitColor = 'success',
  isLoading = false,
  showCloseButton = false,
  size = 'md',
  deleteAction,
  extraActions,
  disableSubmitWhenUnchanged = false
}: FormModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = { ...initialData }
    // Set default values for fields that have them
    fields.forEach(field => {
      if (field.defaultValue !== undefined && data[field.name] === undefined) {
        data[field.name] = field.defaultValue
      }
    })
    return data
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate if form has changes (for disabling submit button)
  const hasChanges = useMemo(() => {
    if (!disableSubmitWhenUnchanged) return true
    
    // Compare current form data with initial data
    for (const field of fields) {
      const currentValue = formData[field.name]
      const initialValue = initialData?.[field.name as keyof T]
      
      // Handle different value types
      if (currentValue !== initialValue) {
        // For strings, also check if both are empty/undefined
        if (typeof currentValue === 'string' && typeof initialValue === 'string') {
          if (currentValue.trim() !== initialValue.trim()) {
            return true
          }
        } else {
          return true
        }
      }
    }
    return false
  }, [formData, initialData, fields, disableSubmitWhenUnchanged])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      const value = formData[field.name]
      
      // Required field validation
      if (field.required) {
        if (field.type === 'checkbox') {
          // For checkboxes, we don't typically enforce required
        } else if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.name] = `${field.label} is required`
        }
      }
      
      // Custom validation function
      if (field.validate && value) {
        const validationError = field.validate(value)
        if (validationError) {
          newErrors[field.name] = validationError
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Process nullable fields - convert empty strings to null
    const processedData = { ...formData }
    fields.forEach(field => {
      if (field.nullable && (field.type === 'text' || field.type === 'textarea' || field.type === 'url')) {
        const value = processedData[field.name]
        if (typeof value === 'string') {
          processedData[field.name] = value.trim() || null
        }
      }
    })

    setErrors({})
    await onSubmit(processedData as T)
  }

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || ''
    const error = errors[field.name]

    switch (field.type) {
      case 'text':
        return (
          <Input
            key={field.name}
            type="text"
            label={`${field.label}${field.required ? ' *' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            error={error}
          />
        )

      case 'textarea':
        return (
          <Textarea
            key={field.name}
            label={`${field.label}${field.required ? ' *' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            error={error}
            helpText={field.description}
          />
        )

      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Select
              value={value}
              onChange={(value) => handleFieldChange(field.name, value)}
              options={field.options || []}
              placeholder={`Select ${field.label.toLowerCase()}`}
              className={error ? 'border-red-300' : ''}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )

      case 'url':
        return (
          <Input
            key={field.name}
            type="url"
            label={`${field.label}${field.required ? ' *' : ''}`}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            helpText={field.description}
            error={error}
          />
        )

      case 'checkbox':
        return (
          <Checkbox
            key={field.name}
            id={field.name}
            label={`${field.label}${field.required ? ' *' : ''}`}
            description={field.description}
            checked={formData[field.name] ?? field.defaultValue ?? false}
            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            error={error}
          />
        )

      case 'custom':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.customComponent ? 
              field.customComponent(value, (newValue) => handleFieldChange(field.name, newValue), error) :
              null
            }
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }


  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={showCloseButton}
      size={size}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing="md">
          {fields.map(renderField)}
        </VStack>

        {extraActions && (
          <div className="mt-4">
            {extraActions}
          </div>
        )}

        <HStack spacing="sm" className="pt-4">
          {deleteAction && (
            <ActionButton
              type="button"
              onClick={deleteAction.onDelete}
              disabled={deleteAction.isDeleting || isLoading}
              isLoading={deleteAction.isDeleting}
              variant="danger"
            >
              {deleteAction.isDeleting ? 'Deleting...' : deleteAction.text}
            </ActionButton>
          )}
          
          <ActionButton
            type="submit"
            disabled={isLoading || !hasChanges}
            isLoading={isLoading}
            variant={submitColor}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : submitText}
          </ActionButton>
          
          <ActionButton
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </ActionButton>
        </HStack>
      </form>
    </BaseModal>
  )
}