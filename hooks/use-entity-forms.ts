'use client'

import { FormField } from '@/components/ui/form-modal'
import { EntityConfig } from './use-entity-crud'
import { useCreateEntity, useUpdateEntity, useDeleteEntity } from './use-entity-crud'
import { useMutationStates, StandardMessages } from './use-form-patterns'

// Base entity interface
interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
}

// Entity form configuration
export interface EntityFormConfig<T extends BaseEntity> {
  entityConfig: EntityConfig<T>
  fields: FormField[]
  entityName: string // Human-readable name for messages
  submitText?: {
    create?: string
    update?: string
  }
  customValidation?: (data: Partial<T>) => Record<string, string>
}

// Generic entity form hooks factory
export function createEntityFormHooks<T extends BaseEntity>(config: EntityFormConfig<T>) {
  
  // Create form hook
  const useCreateForm = () => {
    const createMutation = useCreateEntity(config.entityConfig)
    
    const { isLoading } = useMutationStates(createMutation)
    
    const handleSubmit = async (data: Partial<T>) => {
      // Apply custom validation if provided
      if (config.customValidation) {
        const validationErrors = config.customValidation(data)
        if (Object.keys(validationErrors).length > 0) {
          throw new Error('Validation failed')
        }
      }
      
      await createMutation.mutateAsync(data)
    }
    
    return {
      handleSubmit,
      isLoading,
      error: createMutation.error,
      isError: createMutation.isError,
      submitText: config.submitText?.create || `Create ${config.entityName}`,
      submitColor: 'primary' as const,
    }
  }

  // Edit form hook  
  const useEditForm = () => {
    const updateMutation = useUpdateEntity(config.entityConfig)
    const deleteMutation = useDeleteEntity(config.entityConfig)
    
    const { isLoading } = useMutationStates(updateMutation, deleteMutation)
    
    const handleSubmit = async (data: Partial<T> & { id: string }) => {
      // Apply custom validation if provided
      if (config.customValidation) {
        const validationErrors = config.customValidation(data)
        if (Object.keys(validationErrors).length > 0) {
          throw new Error('Validation failed')
        }
      }
      
      await updateMutation.mutateAsync(data)
    }
    
    const handleDelete = async (id: string) => {
      await deleteMutation.mutateAsync(id)
    }
    
    return {
      handleSubmit,
      handleDelete,
      isLoading,
      isDeleting: deleteMutation.isPending,
      error: updateMutation.error || deleteMutation.error,
      isError: updateMutation.isError || deleteMutation.isError,
      submitText: config.submitText?.update || `Update ${config.entityName}`,
      submitColor: 'primary' as const,
      deleteAction: {
        text: `Delete ${config.entityName}`,
        onDelete: handleDelete,
        isDeleting: deleteMutation.isPending,
      }
    }
  }

  return {
    useCreateForm,
    useEditForm,
    fields: config.fields,
    entityName: config.entityName,
  }
}

// Specific entity form configurations
export interface UniverseFormData {
  name: string
  description?: string
}

export interface ContentItemFormData {
  title: string
  description?: string
  item_type: string
}

export interface ContentVersionFormData {
  version_name: string
  notes?: string
}

export interface CustomContentTypeFormData {
  name: string
  emoji: string
  universe_id: string
}

// Helper to create form fields for specific entity types
export const createEntityFields = {
  universe: (): FormField[] => [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'e.g. Marvel Cinematic Universe',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description of your universe...',
      rows: 3,
      nullable: true,
    },
  ],

  contentItem: (contentTypeOptions: Array<{ value: string; label: string; emoji?: string }>): FormField[] => [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'e.g. Iron Man, Season 1, Chapter 5',
      required: true,
    },
    {
      name: 'item_type',
      label: 'Type',
      type: 'select',
      required: true,
      options: contentTypeOptions,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description...',
      rows: 3,
      nullable: true,
    },
  ],

  contentVersion: (options?: { nameLabel?: string; notesLabel?: string }): FormField[] => [
    {
      name: 'version_name',
      label: options?.nameLabel || 'Version Name',
      type: 'text',
      placeholder: "Director's Cut",
      required: true,
    },
    {
      name: 'notes',
      label: options?.notesLabel || 'Notes',
      type: 'textarea',
      placeholder: 'Additional information about this version...',
      rows: 3,
      nullable: true,
    },
  ],

  customContentType: (): FormField[] => [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'e.g. Character, Location, Event',
      required: true,
    },
    {
      name: 'emoji',
      label: 'Emoji',
      type: 'emoji-picker',
      required: false, // Will get default emoji from entity config
    },
  ],
}

// Generic form validation helpers
export const createEntityValidation = {
  basic: <T extends BaseEntity>(data: Partial<T>): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    // Basic required field validation
    if ('name' in data && !data.name) {
      errors.name = 'Name is required'
    }
    if ('title' in data && !data.title) {
      errors.title = 'Title is required'
    }
    
    return errors
  },

  withLength: <T extends BaseEntity>(
    data: Partial<T>, 
    limits?: { name?: number; title?: number; description?: number }
  ): Record<string, string> => {
    const errors = createEntityValidation.basic(data)
    
    // Length validation
    if ('name' in data && data.name && typeof data.name === 'string') {
      if (data.name.length > (limits?.name || 100)) {
        errors.name = `Name must be ${limits?.name || 100} characters or less`
      }
    }
    
    if ('title' in data && data.title && typeof data.title === 'string') {
      if (data.title.length > (limits?.title || 200)) {
        errors.title = `Title must be ${limits?.title || 200} characters or less`
      }
    }
    
    if ('description' in data && data.description && typeof data.description === 'string') {
      if (data.description.length > (limits?.description || 1000)) {
        errors.description = `Description must be ${limits?.description || 1000} characters or less`
      }
    }
    
    return errors
  },
}

// Utility to generate consistent form configuration
export function createFormConfig<T extends BaseEntity>(
  entityConfig: EntityConfig<T>,
  entityName: string,
  fields: FormField[],
  options?: {
    submitText?: { create?: string; update?: string }
    customValidation?: (data: Partial<T>) => Record<string, string>
  }
): EntityFormConfig<T> {
  return {
    entityConfig,
    entityName,
    fields,
    submitText: options?.submitText,
    customValidation: options?.customValidation || createEntityValidation.basic,
  }
}