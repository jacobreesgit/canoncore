'use client'

import { useRouter } from 'next/navigation'
import { useCreateUniverse } from '@/hooks/use-universes'
import { FormModal, FormField } from './ui'

interface CreateUniverseModalProps {
  onClose: () => void
}

interface UniverseFormData {
  name: string
  description?: string
}

export function CreateUniverseModal({ onClose }: CreateUniverseModalProps) {
  const router = useRouter()
  const createUniverse = useCreateUniverse()

  const handleSubmit = async (data: UniverseFormData) => {
    try {
      const newUniverse = await createUniverse.mutateAsync({
        name: data.name.trim(),
        description: data.description,
      })
      onClose()
      // Navigate to the new universe page
      router.push(`/universes/${newUniverse.slug}`)
    } catch (error) {
      console.error('Failed to create universe:', error)
      throw error // Let FormModal handle the error state
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
      rows: 3,
      nullable: true
    }
  ]

  return (
    <FormModal<UniverseFormData>
      isOpen={true}
      onClose={onClose}
      title="Create New Universe"
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Create Universe"
      submitColor="primary"
      isLoading={createUniverse.isPending}
    />
  )
}