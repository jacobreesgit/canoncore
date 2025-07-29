'use client'

import { BaseModal, LoadingWrapper } from '@/components/ui'
import { useContentItems } from '@/hooks/use-content-items'
import { useRelationshipTypes } from '@/hooks/use-content-links'
import { RelationshipForm } from './relationship-form'

interface CreateRelationshipModalProps {
  fromItemId: string
  universeId: string
  onClose: () => void
}

export function CreateRelationshipModal({
  fromItemId,
  universeId,
  onClose
}: CreateRelationshipModalProps) {
  const { isLoading: itemsLoading } = useContentItems(universeId)
  const { isLoading: typesLoading } = useRelationshipTypes(universeId)

  const isLoading = itemsLoading || typesLoading

  return (
    <BaseModal
      isOpen={true}
      title="Add Relationship"
      onClose={onClose}
      size="md"
    >
      {isLoading ? (
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Loading content items..."
        >
          <div />
        </LoadingWrapper>
      ) : (
        <RelationshipForm
          fromItemId={fromItemId}
          universeId={universeId}
          onSubmit={onClose}
          onCancel={onClose}
          showHierarchy={true}
        />
      )}
    </BaseModal>
  )
}