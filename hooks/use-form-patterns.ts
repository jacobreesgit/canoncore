'use client'

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
    name?: string
    label?: string
    placeholder?: string
    rows?: number
    required?: boolean
  }): FormField => ({
    name: options?.name || 'description',
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

  url: (options?: {
    name?: string
    label?: string
    placeholder?: string
    required?: boolean
  }): FormField => ({
    name: options?.name || 'url',
    label: options?.label || 'URL',
    type: 'url',
    placeholder: options?.placeholder || 'https://example.com',
    nullable: true,
    required: options?.required ?? false,
    validate: Validators.url(),
  }),

  checkbox: (options: {
    name: string
    label: string
    description?: string
    defaultValue?: boolean
  }): FormField => ({
    name: options.name,
    label: options.label,
    type: 'checkbox',
    description: options.description,
    defaultValue: options.defaultValue ?? false,
  }),
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
    StandardFields.checkbox({
      name: 'is_public',
      label: 'Public Universe',
      description: 'Allow others to discover and view this universe',
      defaultValue: true,
    }),
    StandardFields.url({
      name: 'source_url',
      label: 'Data Source URL',
      placeholder: 'https://docs.google.com/spreadsheets/d/...',
    }),
    StandardFields.description({
      name: 'source_description',
      label: 'Source Description',
      placeholder: 'Optional attribution or description of data source...',
      rows: 2,
    }),
  ],

  // Content item fields (with type selection)
  contentItem: (organisationTypeOptions: Array<{ value: string; label: string }>) => [
    StandardFields.title({ placeholder: 'e.g. Iron Man, Season 1, Chapter 5' }),
    StandardFields.select({
      name: 'item_type',
      label: 'Type',
      options: organisationTypeOptions,
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

  // Custom organisation type fields
  customOrganisationType: () => [
    StandardFields.name({ placeholder: 'e.g. Character, Location, Event' }),
  ],

  // Custom relationship type fields
  customRelationshipType: () => [
    StandardFields.name({ placeholder: 'e.g. Crossover, Easter Egg, Inspiration' }),
    StandardFields.description({ placeholder: 'Describe what this relationship type means...' }),
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