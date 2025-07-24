'use client'

import { ContentVersion, contentVersionConfig } from '@/hooks/use-content-versions'
import { EntityFormModal } from './ui/entity-form-modal'
import { FieldPresets } from '@/hooks/use-form-patterns'

interface EditContentVersionModalProps {
  version: ContentVersion | null
  isOpen: boolean
  onClose: () => void
}

export function EditContentVersionModal({ version, isOpen, onClose }: EditContentVersionModalProps) {
  if (!version) return null

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
      mode="edit"
      entityConfig={contentVersionConfig}
      entityName="Content Version"
      fields={fields}
      initialData={version}
    />
  )
}