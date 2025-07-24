'use client'

import { CustomContentType } from '@/types/database'
import { customContentTypeConfig } from '@/hooks/use-custom-content-types'
import { EntityFormModal } from './ui/entity-form-modal'
import { FieldPresets } from '@/hooks/use-form-patterns'

interface CustomContentTypeModalProps {
  universeId: string
  onClose: () => void
  editingType?: CustomContentType
}

export function CustomContentTypeModal({ universeId, onClose, editingType }: CustomContentTypeModalProps) {
  // Add universe_id to the data before submit
  const beforeSubmit = async (data: Partial<CustomContentType>) => {
    return {
      ...data,
      universe_id: universeId,
    }
  }

  return (
    <EntityFormModal<CustomContentType>
      isOpen={true}
      onClose={onClose}
      mode={editingType ? 'edit' : 'create'}
      entityConfig={customContentTypeConfig}
      entityName="Custom Content Type"
      fields={FieldPresets.customContentType()}
      initialData={editingType}
      beforeSubmit={beforeSubmit}
    />
  )
}