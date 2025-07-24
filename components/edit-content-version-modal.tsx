'use client'

import { useUpdateContentVersion, UpdateContentVersionData, ContentVersion } from '@/hooks/use-content-versions'
import { FormModal, FormField } from './ui'

interface EditContentVersionModalProps {
  version: ContentVersion | null
  isOpen: boolean
  onClose: () => void
}

interface EditContentVersionFormData {
  version_name: string
  notes: string
}

export function EditContentVersionModal({ version, isOpen, onClose }: EditContentVersionModalProps) {
  const updateVersionMutation = useUpdateContentVersion()

  const handleSubmit = async (data: EditContentVersionFormData) => {
    if (!version) return

    const updateData: UpdateContentVersionData = {
      version_name: data.version_name.trim(),
      notes: data.notes,
    }

    try {
      await updateVersionMutation.mutateAsync({
        versionId: version.id,
        data: updateData,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update version:', error)
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
      nullable: true,
    },
  ]

  const initialData: Partial<EditContentVersionFormData> = version ? {
    version_name: version.version_name,
    notes: version.notes || '',
  } : {}

  if (!version) return null

  return (
    <FormModal<EditContentVersionFormData>
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Version"
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText="Update Version"
      submitColor="primary"
      isLoading={updateVersionMutation.isPending}
      showCloseButton={true}
    />
  )
}