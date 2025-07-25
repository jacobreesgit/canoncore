'use client'

import { Universe } from '@/types/database'
import { universeConfig } from '@/hooks/use-universes'
import { EntityFormModal } from '@/components/ui'
import { FieldPresets } from '@/hooks/use-form-patterns'

interface EditUniverseModalProps {
  universe: Universe
  onClose: () => void
}

export function EditUniverseModal({ universe, onClose }: EditUniverseModalProps) {
  return (
    <EntityFormModal<Universe>
      isOpen={true}
      onClose={onClose}
      mode="edit"
      entityConfig={universeConfig}
      entityName="Universe"
      fields={FieldPresets.universe()}
      initialData={universe}
    />
  )
}