'use client'

import { CustomOrganisationType } from '@/types/database'
import { customOrganisationTypeConfig } from '@/hooks/use-custom-organisation-types'
import { EntityFormModal } from '@/components/ui'
import { FieldPresets } from '@/hooks/use-form-patterns'

interface CustomContentTypeModalProps {
  universeId: string
  onClose: () => void
  editingType?: CustomOrganisationType
}

export function CustomContentTypeModal({ universeId, onClose, editingType }: CustomContentTypeModalProps) {
  // Add universe_id to the data before submit
  const beforeSubmit = async (data: Partial<CustomOrganisationType>) => {
    return {
      ...data,
      universe_id: universeId,
    }
  }

  return (
    <EntityFormModal<CustomOrganisationType>
      isOpen={true}
      onClose={onClose}
      mode={editingType ? 'edit' : 'create'}
      entityConfig={customOrganisationTypeConfig}
      entityName="Custom Organisation Type"
      fields={FieldPresets.customOrganisationType()}
      initialData={editingType}
      beforeSubmit={beforeSubmit}
    />
  )
}