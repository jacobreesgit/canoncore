'use client'

import { CustomRelationshipType } from '@/types/database'
import { customRelationshipTypeConfig } from '@/hooks/use-custom-relationship-types'
import { EntityFormModal } from '@/components/ui'
import { FieldPresets } from '@/hooks/use-form-patterns'

interface CustomRelationshipTypeModalProps {
  universeId: string
  onClose: () => void
  editingType?: CustomRelationshipType
}

export function CustomRelationshipTypeModal({ universeId, onClose, editingType }: CustomRelationshipTypeModalProps) {
  // Add universe_id to the data before submit
  const beforeSubmit = async (data: Partial<CustomRelationshipType>) => {
    return {
      ...data,
      universe_id: universeId,
    }
  }

  return (
    <EntityFormModal<CustomRelationshipType>
      isOpen={true}
      onClose={onClose}
      mode={editingType ? 'edit' : 'create'}
      entityConfig={customRelationshipTypeConfig}
      entityName="Custom Relationship Type"
      fields={FieldPresets.customRelationshipType()}
      initialData={editingType}
      beforeSubmit={beforeSubmit}
    />
  )
}