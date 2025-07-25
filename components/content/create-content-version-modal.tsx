'use client'

import { ContentVersion, contentVersionConfig } from '@/hooks/use-content-versions'
import { EntityFormModal } from '@/components/ui'
import { FieldPresets } from '@/hooks/use-form-patterns'

interface CreateContentVersionModalProps {
  contentItemId: string
  isOpen: boolean
  onClose: () => void
}

export function CreateContentVersionModal({ contentItemId, isOpen, onClose }: CreateContentVersionModalProps) {
  // Add content_item_id to the data before submit
  const beforeSubmit = async (data: Partial<ContentVersion>) => {
    return {
      ...data,
      content_item_id: contentItemId,
    }
  }

  const fields = [
    {
      name: 'version_name',
      label: 'Version Name',
      type: 'text' as const,
      placeholder: "Director's Cut",
      required: true,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional information about this version...',
      rows: 3,
      nullable: true,
    },
  ]

  return (
    <EntityFormModal<ContentVersion>
      isOpen={isOpen}
      onClose={onClose}
      mode="create"
      entityConfig={contentVersionConfig}
      entityName="Content Version"
      fields={fields}
      beforeSubmit={beforeSubmit}
    />
  )
}