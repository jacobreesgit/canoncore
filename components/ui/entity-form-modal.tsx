'use client'

import { useRouter } from 'next/navigation'
import { FormModal, FormField } from './form-modal'
import { EntityConfig, useCreateEntity, useUpdateEntity, useDeleteEntity } from '@/hooks/use-entity-crud'
import { useMutationStates } from '@/hooks/use-form-patterns'

// Base entity interface
interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
}

// Generic entity form modal props
interface EntityFormModalProps<T extends BaseEntity> {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  
  // Entity configuration
  entityConfig: EntityConfig<T>
  entityName: string
  
  // Form configuration
  fields: FormField[]
  initialData?: Partial<T>
  
  // Optional customization
  title?: string
  submitText?: string
  submitColor?: 'success' | 'primary' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  
  // Navigation after create (optional)
  navigateAfterCreate?: (entity: T) => string
  
  // Custom validation
  customValidation?: (data: Partial<T>) => Record<string, string>
  
  // Custom submission handling
  beforeSubmit?: (data: Partial<T>) => Partial<T> | Promise<Partial<T>>
  afterSubmit?: (entity: T) => void | Promise<void>
}

export function EntityFormModal<T extends BaseEntity>({
  isOpen,
  onClose,
  mode,
  entityConfig,
  entityName,
  fields,
  initialData,
  title,
  submitText,
  submitColor,
  size,
  navigateAfterCreate,
  customValidation,
  beforeSubmit,
  afterSubmit,
}: EntityFormModalProps<T>) {
  const router = useRouter()
  
  // Entity CRUD hooks
  const createMutation = useCreateEntity(entityConfig)
  const updateMutation = useUpdateEntity(entityConfig)
  const deleteMutation = useDeleteEntity(entityConfig)
  
  // Aggregate loading states
  const { isLoading } = useMutationStates(createMutation, updateMutation, deleteMutation)
  
  // Form submission handler
  const handleSubmit = async (data: Partial<T>) => {
    try {
      // Apply custom validation if provided
      if (customValidation) {
        const validationErrors = customValidation(data)
        if (Object.keys(validationErrors).length > 0) {
          // Let FormModal handle validation errors
          throw new Error('Validation failed')
        }
      }
      
      // Apply before submit transformation
      let processedData = data
      if (beforeSubmit) {
        processedData = await beforeSubmit(data)
      }
      
      // Submit based on mode
      let result: T
      if (mode === 'create') {
        result = await createMutation.mutateAsync(processedData)
      } else {
        if (!data.id) {
          throw new Error('ID is required for update')
        }
        result = await updateMutation.mutateAsync(processedData as Partial<T> & { id: string })
      }
      
      // Apply after submit callback
      if (afterSubmit) {
        await afterSubmit(result)
      }
      
      // Navigate after create if specified
      if (mode === 'create' && navigateAfterCreate) {
        const path = navigateAfterCreate(result)
        router.push(path)
      }
      
      // Close modal
      onClose()
      
    } catch (error) {
      console.error(`Failed to ${mode} ${entityName.toLowerCase()}:`, error)
      throw error // Let FormModal handle the error display
    }
  }
  
  // Delete handler for edit mode
  const handleDelete = async () => {
    if (mode !== 'edit' || !initialData?.id) return
    
    try {
      await deleteMutation.mutateAsync(initialData.id)
      onClose()
    } catch (error) {
      console.error(`Failed to delete ${entityName.toLowerCase()}:`, error)
      throw error
    }
  }
  
  // Generate default title
  const defaultTitle = mode === 'create' ? `Create New ${entityName}` : `Edit ${entityName}`
  
  // Generate default submit text
  const defaultSubmitText = mode === 'create' ? `Create ${entityName}` : `Update ${entityName}`
  
  // Generate default submit color
  const defaultSubmitColor = mode === 'create' ? 'success' : 'primary'
  
  // Create delete action for edit mode
  const deleteAction = mode === 'edit' && initialData?.id ? {
    text: `Delete ${entityName}`,
    onDelete: handleDelete,
    isDeleting: deleteMutation.isPending,
  } : undefined
  
  return (
    <FormModal<Partial<T>>
      isOpen={isOpen}
      onClose={onClose}
      title={title || defaultTitle}
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText={submitText || defaultSubmitText}
      submitColor={submitColor || defaultSubmitColor}
      isLoading={isLoading}
      size={size}
      deleteAction={deleteAction}
    />
  )
}

// Factory function to create entity-specific modal components
export function createEntityModalComponents<T extends BaseEntity>(
  entityConfig: EntityConfig<T>,
  entityName: string,
  fields: FormField[],
  options?: {
    navigateAfterCreate?: (entity: T) => string
    customValidation?: (data: Partial<T>) => Record<string, string>
    beforeSubmit?: (data: Partial<T>) => Partial<T> | Promise<Partial<T>>
  }
) {
  
  const CreateModal = (props: {
    isOpen: boolean
    onClose: () => void
    initialData?: Partial<T>
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }) => (
    <EntityFormModal<T>
      {...props}
      mode="create"
      entityConfig={entityConfig}
      entityName={entityName}
      fields={fields}
      navigateAfterCreate={options?.navigateAfterCreate}
      customValidation={options?.customValidation}
      beforeSubmit={options?.beforeSubmit}
    />
  )
  
  const EditModal = (props: {
    isOpen: boolean
    onClose: () => void
    initialData: Partial<T> & { id: string }
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }) => (
    <EntityFormModal<T>
      {...props}
      mode="edit"
      entityConfig={entityConfig}
      entityName={entityName}
      fields={fields}
      customValidation={options?.customValidation}
      beforeSubmit={options?.beforeSubmit}
    />
  )
  
  return {
    CreateModal,
    EditModal,
    fields,
    entityConfig,
    entityName,
  }
}

// Generic form submission utilities
export const FormSubmissionUtils = {
  // Standard validation messages
  getRequiredFieldError: (fieldName: string) => `${fieldName} is required`,
  getLengthError: (fieldName: string, max: number) => `${fieldName} must be ${max} characters or less`,
  
  // Standard field processing
  processTextFields: (data: Record<string, any>, fields: string[]) => {
    const processed = { ...data }
    fields.forEach(field => {
      if (processed[field] && typeof processed[field] === 'string') {
        processed[field] = processed[field].trim()
      }
    })
    return processed
  },
  
  // Standard navigation patterns
  createNavigationPath: {
    universeDetail: (universe: any) => `/universes/${universe.slug}`,
    contentDetail: (content: any) => `/universes/${content.universe_slug}/content/${content.id}`,
    backToList: () => '/',
  },
}

// Type exports for convenience
export type { EntityFormModalProps, BaseEntity }