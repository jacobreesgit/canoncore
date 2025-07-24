'use client'

import { Universe } from '@/types/database'
import { createEntityFormHooks, createFormConfig, createEntityFields, UniverseFormData } from './use-entity-forms'

// Import universe entity configuration from existing hooks
const universeConfig = {
  tableName: 'universes',
  queryKey: 'universes',
  defaultOrder: { column: 'created_at', ascending: false },
  // Note: The actual beforeCreate, afterCreate, etc. are defined in use-universes.ts
  // This is a simplified version for form purposes
} as any // We'll import the actual config later

// Create universe form configuration
const universeFormConfig = createFormConfig<Universe>(
  universeConfig,
  'Universe',
  createEntityFields.universe(),
  {
    submitText: {
      create: 'Create Universe',
      update: 'Update Universe'
    },
    customValidation: (data) => {
      const errors: Record<string, string> = {}
      
      if (!data.name || data.name.trim().length === 0) {
        errors.name = 'Universe name is required'
      }
      
      if (data.name && data.name.length > 100) {
        errors.name = 'Universe name must be 100 characters or less'
      }
      
      if (data.description && data.description.length > 500) {
        errors.description = 'Description must be 500 characters or less'
      }
      
      return errors
    }
  }
)

// Export universe form hooks
export const universeFormHooks = createEntityFormHooks(universeFormConfig)

// Convenience exports
export const useCreateUniverseForm = universeFormHooks.useCreateForm
export const useEditUniverseForm = universeFormHooks.useEditForm
export const universeFormFields = universeFormHooks.fields

// Type exports
export type { UniverseFormData }