'use client'

import { useState, ReactNode } from 'react'
import { BaseModal } from './base-modal'
import { ActionButton } from './action-button'
import { VStack, HStack } from './stack'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'custom'
  placeholder?: string
  required?: boolean
  nullable?: boolean // For text/textarea fields that should convert empty strings to null
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
  extraActions
}: FormModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Process nullable fields - convert empty strings to null
    const processedData = { ...formData }
    fields.forEach(field => {
      if (field.nullable && (field.type === 'text' || field.type === 'textarea')) {
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
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 resize-none ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
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
            disabled={isLoading}
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