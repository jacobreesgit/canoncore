'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Universe } from '@/types/database'
import { universeConfig } from '@/hooks/use-universes'
import { EntityFormModal } from './ui/entity-form-modal'
import { FieldPresets } from '@/hooks/use-form-patterns'
import { LoadingPlaceholder } from './ui'

interface CreateUniverseModalProps {
  onClose: () => void
}

export function CreateUniverseModal({ onClose }: CreateUniverseModalProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleAfterSubmit = async (universe: Universe) => {
    setIsNavigating(true)
    // Add a small delay to ensure the loading state is visible
    await new Promise(resolve => setTimeout(resolve, 100))
    router.push(`/${universe.username}/${universe.slug}`)
  }

  if (isNavigating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <LoadingPlaceholder 
            title="Creating universe..." 
            message="Redirecting to your new universe"
          />
        </div>
      </div>
    )
  }

  return (
    <EntityFormModal<Universe>
      isOpen={true}
      onClose={onClose}
      mode="create"
      entityConfig={universeConfig}
      entityName="Universe"
      fields={FieldPresets.universe()}
      afterSubmit={handleAfterSubmit}
    />
  )
}