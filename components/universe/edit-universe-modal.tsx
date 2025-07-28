'use client'

import { Universe } from '@/types/database'
import { universeConfig } from '@/hooks/use-universes'
import { EntityFormModal } from '@/components/ui'
import { FieldPresets } from '@/hooks/use-form-patterns'
import { useRouter } from 'next/navigation'

interface EditUniverseModalProps {
  universe: Universe
  username: string
  onClose: () => void
}

export function EditUniverseModal({ universe, username, onClose }: EditUniverseModalProps) {
  const router = useRouter()

  const handleAfterSubmit = (updatedUniverse: Universe) => {
    // If the slug changed, navigate to the new URL
    if (updatedUniverse.slug !== universe.slug) {
      router.push(`/${username}/${updatedUniverse.slug}`)
    }
  }

  return (
    <EntityFormModal<Universe>
      isOpen={true}
      onClose={onClose}
      mode="edit"
      entityConfig={universeConfig}
      entityName="Universe"
      fields={FieldPresets.universe()}
      initialData={universe}
      afterSubmit={handleAfterSubmit}
    />
  )
}