'use client'

import { useUpdateUniverse } from '@/hooks/use-universes'
import { Universe } from '@/types/database'
import { FormModal, FormField } from './ui'

interface EditUniverseModalProps {
  universe: Universe
  onClose: () => void
}

interface UniverseFormData {
  name: string
  description?: string
}

export function EditUniverseModal({ universe, onClose }: EditUniverseModalProps) {
  const updateUniverse = useUpdateUniverse()

  const initialData: UniverseFormData = {
    name: universe.name,
    description: universe.description || ''
  }

  const handleSubmit = async (data: UniverseFormData) => {
    try {
      await updateUniverse.mutateAsync({
        id: universe.id,
        updates: {
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
        },
      })
      onClose()
    } catch (error) {
      console.error('Failed to update universe:', error)
      throw error
    }
  }

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'e.g. Marvel Cinematic Universe',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description of your universe...',
      rows: 3
    }
  ]

  return (
    <FormModal<UniverseFormData>
      isOpen={true}
      onClose={onClose}
      title="Edit Universe"
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText="Update Universe"
      submitColor="blue"
      isLoading={updateUniverse.isPending}
    />
  )
}