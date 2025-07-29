'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Universe } from '@/types/database'
import { universeConfig } from '@/hooks/use-universes'
import { EntityFormModal, BaseModal, LoadingWrapper } from '@/components/ui'
import { FieldPresets } from '@/hooks/use-form-patterns'

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
      <BaseModal isOpen={true} onClose={() => {}} title="Creating Universe">
        <div className="p-6">
          <LoadingWrapper 
            isLoading={true}
            fallback="placeholder"
            title="Creating universe..." 
            message="Redirecting to your new universe"
          >
            <div />
          </LoadingWrapper>
        </div>
      </BaseModal>
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