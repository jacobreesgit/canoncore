'use client'

import { useState } from 'react'
import { FormField } from '@/components/ui'

// Standard validation functions
export const Validators = {
  required: (message?: string) => (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message || 'This field is required'
    }
    return null
  },
  
  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`
    }
    return null
  },
  
  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`
    }
    return null
  },
  
  email: (message?: string) => (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message || 'Please enter a valid email address'
    }
    return null
  },
  
  url: (message?: string) => (value: string) => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return message || 'Please enter a valid URL'
    }
    return null
  }
}

// Standard field factory functions
export const StandardFields = {
  name: (options?: {
    label?: string
    placeholder?: string
    required?: boolean
    maxLength?: number
  }): FormField => ({
    name: 'name',
    label: options?.label || 'Name',
    type: 'text',
    placeholder: options?.placeholder || `e.g. ${options?.label || 'Name'}`,
    required: options?.required ?? true,
  }),

  title: (options?: {
    label?: string
    placeholder?: string
    required?: boolean
  }): FormField => ({
    name: 'title',
    label: options?.label || 'Title',
    type: 'text',
    placeholder: options?.placeholder || `e.g. ${options?.label || 'Title'}`,
    required: options?.required ?? true,
  }),

  description: (options?: {
    label?: string
    placeholder?: string
    rows?: number
    required?: boolean
  }): FormField => ({
    name: 'description',
    label: options?.label || 'Description',
    type: 'textarea',
    placeholder: options?.placeholder || `Brief ${(options?.label || 'description').toLowerCase()}...`,
    rows: options?.rows || 3,
    nullable: true,
    required: options?.required ?? false,
  }),

  notes: (options?: {
    label?: string
    placeholder?: string
    rows?: number
  }): FormField => ({
    name: 'notes',
    label: options?.label || 'Notes',
    type: 'textarea',
    placeholder: options?.placeholder || `Additional ${(options?.label || 'notes').toLowerCase()}...`,
    rows: options?.rows || 3,
    nullable: true,
  }),


  select: (options: {
    name: string
    label: string
    options: Array<{ value: string; label: string }>
    placeholder?: string
    required?: boolean
  }): FormField => ({
    name: options.name,
    label: options.label,
    type: 'select',
    options: options.options,
    placeholder: options.placeholder,
    required: options.required ?? true,
  }),
}

// Form configuration interface
export interface FormConfig<T = Record<string, any>> {
  fields: FormField[]
  initialData?: Partial<T>
  validation?: Record<string, (value: any) => string | null>
  onSubmit: (data: T) => Promise<void>
  submitText?: string
  submitColor?: 'success' | 'primary' | 'warning'
}

// Enhanced form state management hook
export function useFormState<T = Record<string, any>>(config: FormConfig<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: any): string | null => {
    const validator = config.validation?.[name]
    if (validator) {
      return validator(value)
    }
    
    // Find field configuration for built-in validation
    const field = config.fields.find(f => f.name === name)
    if (field?.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`
    }
    
    return null
  }

  const validateForm = (data: Record<string, any>): Record<string, string> => {
    const newErrors: Record<string, string> = {}
    
    config.fields.forEach(field => {
      const error = validateField(field.name, data[field.name])
      if (error) {
        newErrors[field.name] = error
      }
    })
    
    return newErrors
  }

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true)
    try {
      const validationErrors = validateForm(data as Record<string, any>)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
      
      setErrors({})
      await config.onSubmit(data)
    } catch (error) {
      // Let the component handle the error display
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return {
    isSubmitting,
    errors,
    touched,
    validateField,
    validateForm,
    handleSubmit,
    handleFieldChange,
  }
}

// Mutation state aggregator for consistent loading states
export function useMutationStates(...mutations: Array<{ isPending?: boolean; isError?: boolean; error?: any }>) {
  return {
    isLoading: mutations.some(m => m.isPending),
    isError: mutations.some(m => m.isError),
    error: mutations.find(m => m.error)?.error,
  }
}

// Standard field combinations for common entity types
export const FieldPresets = {
  // Basic entity with name and description
  basicEntity: (options?: { nameLabel?: string; descriptionLabel?: string }) => [
    StandardFields.name({ label: options?.nameLabel }),
    StandardFields.description({ label: options?.descriptionLabel }),
  ],

  // Universe fields
  universe: () => [
    StandardFields.name({ placeholder: 'e.g. Marvel Cinematic Universe' }),
    StandardFields.description({ placeholder: 'Brief description of your universe...' }),
  ],

  // Content item fields (with type selection)
  contentItem: (contentTypeOptions: Array<{ value: string; label: string }>) => [
    StandardFields.title({ placeholder: 'e.g. Iron Man, Season 1, Chapter 5' }),
    StandardFields.select({
      name: 'item_type',
      label: 'Type',
      options: contentTypeOptions,
    }),
    StandardFields.description({ placeholder: 'Brief description...' }),
  ],

  // Version fields
  version: (options?: { nameLabel?: string; notesLabel?: string }) => [
    StandardFields.name({ 
      label: options?.nameLabel || 'Version Name',
      placeholder: options?.nameLabel === 'Version Name' ? "Director's Cut" : undefined
    }),
    StandardFields.notes({ label: options?.notesLabel }),
  ],

  // Custom content type fields
  customContentType: () => [
    StandardFields.name({ placeholder: 'e.g. Character, Location, Event' }),
  ],
}

// Generic error messages for consistency
export const StandardMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  creating: (entityName: string) => `Creating ${entityName.toLowerCase()}...`,
  updating: (entityName: string) => `Updating ${entityName.toLowerCase()}...`,
  deleting: (entityName: string) => `Deleting ${entityName.toLowerCase()}...`,
  createSuccess: (entityName: string) => `${entityName} created successfully`,
  updateSuccess: (entityName: string) => `${entityName} updated successfully`, 
  deleteSuccess: (entityName: string) => `${entityName} deleted successfully`,
  createError: (entityName: string) => `Failed to create ${entityName.toLowerCase()}`,
  updateError: (entityName: string) => `Failed to update ${entityName.toLowerCase()}`,
  deleteError: (entityName: string) => `Failed to delete ${entityName.toLowerCase()}`,
}