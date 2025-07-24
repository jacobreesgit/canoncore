'use client'

import { useCreateContentVersion, CreateContentVersionData } from '@/hooks/use-content-versions'
import { FormModal, FormField } from './ui'

interface CreateContentVersionModalProps {
  contentItemId: string
  isOpen: boolean
  onClose: () => void
}

interface CreateContentVersionFormData {
  version_name: string
  notes: string
}

export function CreateContentVersionModal({ contentItemId, isOpen, onClose }: CreateContentVersionModalProps) {
  const createVersionMutation = useCreateContentVersion()

  const handleSubmit = async (data: CreateContentVersionFormData) => {
    const versionData: CreateContentVersionData = {
      content_item_id: contentItemId,
      version_name: data.version_name.trim(),
      notes: data.notes.trim() || undefined,
    }

    try {
      await createVersionMutation.mutateAsync(versionData)
      onClose()
    } catch (error) {
      console.error('Failed to create version:', error)
    }
  }

  const fields: FormField[] = [
    {
      name: 'version_name',
      label: 'Version Name',
      type: 'text',
      placeholder: "Director's Cut",
      required: true,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Additional information about this version...',
      rows: 3,
    },
  ]

  const initialData: Partial<CreateContentVersionFormData> = {
    version_name: '',
    notes: '',
  }

  return (
    <FormModal<CreateContentVersionFormData>
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Version"
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText="Create Version"
      submitColor="primary"
      isLoading={createVersionMutation.isPending}
      showCloseButton={true}
    />
  )
}