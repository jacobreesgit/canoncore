'use client'

import { useCreateUniverseVersion, useNextVersionNumber } from '@/hooks/use-universe-versions'
import { FormModal, FormField } from './ui'

interface CreateVersionModalProps {
  universeId: string
  isOpen: boolean
  onClose: () => void
}

interface CreateVersionFormData {
  versionName: string
  notes: string
}

export function CreateVersionModal({ universeId, isOpen, onClose }: CreateVersionModalProps) {
  const createVersion = useCreateUniverseVersion()
  const { data: nextVersionNumber, isLoading: loadingVersionNumber } = useNextVersionNumber(universeId)

  const handleSubmit = async (data: CreateVersionFormData) => {
    try {
      await createVersion.mutateAsync({
        universeId,
        versionName: data.versionName.trim() || undefined,
        commitMessage: data.notes.trim() || undefined,
      })
      onClose()
    } catch (error) {
      console.error('Failed to create version:', error)
    }
  }

  const fields: FormField[] = [
    {
      name: 'versionName',
      label: 'Version Name',
      type: 'text',
      placeholder: `v${nextVersionNumber || ''}`,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Describe what changed in this version...',
      rows: 3,
    },
  ]

  const initialData: Partial<CreateVersionFormData> = {
    versionName: '',
    notes: '',
  }

  const versionNumberInfo = (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
      <p className="text-sm text-blue-800">
        <strong>Version Number:</strong> {loadingVersionNumber ? 'Loading...' : `v${nextVersionNumber}`}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Leave version name empty to use default: v{nextVersionNumber}
      </p>
    </div>
  )

  return (
    <FormModal<CreateVersionFormData>
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Version"
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText="Create Version"
      submitColor="primary"
      isLoading={createVersion.isPending}
      extraActions={versionNumberInfo}
    />
  )
}