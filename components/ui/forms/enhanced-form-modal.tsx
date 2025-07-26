'use client'

import { FormModal, FormField } from './form-modal'
import { StandardFields, FieldPresets, useMutationStates } from '@/hooks/use-form-patterns'

// Enhanced form modal with preset configurations
interface EnhancedFormModalProps<T = Record<string, any>> {
  isOpen: boolean
  onClose: () => void
  title: string
  mode: 'create' | 'edit'
  entityName: string
  
  // Data
  initialData?: Partial<T>
  
  // Form configuration
  fields?: FormField[]
  fieldPreset?: keyof typeof FieldPresets
  customFields?: Record<string, any>
  
  // Submission
  onSubmit: (data: T) => Promise<void>
  onDelete?: () => Promise<void>
  
  // Mutations for loading states
  mutations?: Array<{ isPending?: boolean; isError?: boolean; error?: any }>
  
  // Customization
  submitText?: string
  submitColor?: 'success' | 'primary' | 'warning'
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function EnhancedFormModal<T = Record<string, any>>({
  isOpen,
  onClose,
  title,
  mode,
  entityName,
  initialData,
  fields,
  fieldPreset,
  customFields,
  onSubmit,
  onDelete,
  mutations = [],
  submitText,
  submitColor,
  showCloseButton,
  size,
}: EnhancedFormModalProps<T>) {
  
  // Get mutation states
  const { isLoading, isError, error } = useMutationStates(...mutations)
  
  // Determine fields to use
  let formFields: FormField[]
  if (fields) {
    formFields = fields
  } else if (fieldPreset) {
    // Some presets need parameters, handle them appropriately
    if (fieldPreset === 'universe' || fieldPreset === 'customOrganisationType') {
      formFields = FieldPresets[fieldPreset]()
    } else if (fieldPreset === 'basicEntity' || fieldPreset === 'version') {
      formFields = FieldPresets[fieldPreset]()
    } else {
      throw new Error(`Unsupported field preset: ${fieldPreset}`)
    }
  } else {
    throw new Error('Either fields or fieldPreset must be provided')
  }
  
  // Add custom fields if provided
  if (customFields && typeof customFields === 'object') {
    Object.entries(customFields).forEach(([key, options]) => {
      if (StandardFields[key as keyof typeof StandardFields]) {
        const fieldFactory = StandardFields[key as keyof typeof StandardFields] as any
        formFields.push(fieldFactory(options))
      }
    })
  }
  
  // Determine submit text and color
  const defaultSubmitText = mode === 'create' ? `Create ${entityName}` : `Update ${entityName}`
  const defaultSubmitColor = mode === 'create' ? 'success' : 'primary'
  
  // Create delete action if in edit mode and onDelete provided
  const deleteAction = mode === 'edit' && onDelete ? {
    text: `Delete ${entityName}`,
    onDelete,
    isDeleting: isLoading, // Simplified - would need separate delete loading state
  } : undefined
  
  return (
    <FormModal<T>
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      fields={formFields}
      initialData={initialData}
      onSubmit={onSubmit}
      submitText={submitText || defaultSubmitText}
      submitColor={submitColor || defaultSubmitColor}
      isLoading={isLoading}
      showCloseButton={showCloseButton}
      size={size}
      deleteAction={deleteAction}
    />
  )
}

// Convenience component factories
export const createEntityModal = <T,>(
  entityName: string,
  fieldPreset: keyof typeof FieldPresets,
  customOptions?: {
    fields?: FormField[]
    customFields?: Record<string, any>
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }
) => {
  const CreateModal = (props: {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: T) => Promise<void>
    mutations?: Array<{ isPending?: boolean; isError?: boolean; error?: any }>
    initialData?: Partial<T>
  }) => (
    <EnhancedFormModal<T>
      {...props}
      title={`Create New ${entityName}`}
      mode="create"
      entityName={entityName}
      fields={customOptions?.fields}
      fieldPreset={customOptions?.fields ? undefined : fieldPreset}
      customFields={customOptions?.customFields}
      size={customOptions?.size}
    />
  )
  
  const EditModal = (props: {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: T) => Promise<void>
    onDelete?: () => Promise<void>
    mutations?: Array<{ isPending?: boolean; isError?: boolean; error?: any }>
    initialData: Partial<T>
  }) => (
    <EnhancedFormModal<T>
      {...props}
      title={`Edit ${entityName}`}
      mode="edit"
      entityName={entityName}
      fields={customOptions?.fields}
      fieldPreset={customOptions?.fields ? undefined : fieldPreset}
      customFields={customOptions?.customFields}
      size={customOptions?.size}
    />
  )
  
  return { CreateModal, EditModal }
}

// Pre-configured modal factories for common entities
export const UniverseModals = createEntityModal('Universe', 'universe')
export const VersionModals = createEntityModal('Version', 'version')
export const CustomOrganisationTypeModals = createEntityModal('Custom Organisation Type', 'customOrganisationType')

// Note: ContentItem modals need to be created with custom fields since they require type selection

// Export field presets for direct use
export { FieldPresets, StandardFields } from '@/hooks/use-form-patterns'