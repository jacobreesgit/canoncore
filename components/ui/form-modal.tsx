'use client'

import { useState, ReactNode } from 'react'
import { BaseModal } from './base-modal'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'emoji-picker'
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string; emoji?: string }>
  rows?: number
  customInput?: ReactNode
}

interface FormModalProps<T = Record<string, any>> {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: FormField[]
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  submitText?: string
  submitColor?: 'green' | 'blue' | 'purple'
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
  submitColor = 'green',
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

    setErrors({})
    await onSubmit(formData as T)
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
                  {option.emoji ? `${option.emoji} ${option.label}` : option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )

      case 'emoji-picker':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.customInput || (
              <input
                type="text"
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const submitColorClasses = {
    green: 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400',
    blue: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400', 
    purple: 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400'
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
        <div className="space-y-4">
          {fields.map(renderField)}
        </div>

        {extraActions && (
          <div className="mt-4">
            {extraActions}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {deleteAction && (
            <button
              type="button"
              onClick={deleteAction.onDelete}
              disabled={deleteAction.isDeleting || isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              {deleteAction.isDeleting ? 'Deleting...' : deleteAction.text}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 ${submitColorClasses[submitColor]} text-white px-4 py-2 rounded-md font-medium transition-colors`}
          >
            {isLoading ? 'Saving...' : submitText}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </BaseModal>
  )
}