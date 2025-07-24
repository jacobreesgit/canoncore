'use client'

import { useUpdateUniverseVersion } from '@/hooks/use-universe-versions'
import { FormModal, FormField } from './ui'
import { UniverseVersion } from '@/types/database'

interface EditUniverseVersionModalProps {
  version: UniverseVersion | null
  isOpen: boolean
  onClose: () => void
}

interface EditUniverseVersionFormData {
  version_name: string
  commit_message: string
}

export function EditUniverseVersionModal({ version, isOpen, onClose }: EditUniverseVersionModalProps) {
  const updateVersionMutation = useUpdateUniverseVersion()

  const handleSubmit = async (data: EditUniverseVersionFormData) => {
    if (!version) return

    const updateData = {
      version_name: data.version_name.trim(),
      commit_message: data.commit_message.trim() || null,
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
      placeholder: 'v2',
      required: true,
    },
    {
      name: 'commit_message',
      label: 'Commit Message',
      type: 'textarea',
      placeholder: 'Describe what changed in this version...',
      rows: 3,
    },
  ]

  const initialData: Partial<EditUniverseVersionFormData> = version ? {
    version_name: version.version_name,
    commit_message: version.commit_message || '',
  } : {}

  if (!version) return null

  return (
    <FormModal<EditUniverseVersionFormData>
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