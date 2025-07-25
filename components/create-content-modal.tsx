'use client'

import { useCreateContentItem } from '@/hooks/use-content-items'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { FormModal, FormField } from './ui'

interface CreateContentModalProps {
  universeId: string
  parentId?: string
  onClose: () => void
}

interface CreateContentFormData {
  title: string
  description: string
  item_type: string
}

export function CreateContentModal({ universeId, parentId, onClose }: CreateContentModalProps) {
  const createContentItem = useCreateContentItem()
  const { data: allContentTypes } = useAllContentTypes(universeId)

  const handleSubmit = async (data: CreateContentFormData) => {
    try {
      await createContentItem.mutateAsync({
        title: data.title.trim(),
        description: data.description,
        item_type: data.item_type,
        universe_id: universeId,
        parent_id: parentId,
      })
      onClose()
    } catch (error) {
      console.error('Failed to create content item:', error)
    }
  }

  const fields: FormField[] = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'e.g. Iron Man, Season 1, Chapter 5',
      required: true,
    },
    {
      name: 'item_type',
      label: 'Type',
      type: 'select',
      required: true,
      options: allContentTypes?.map(type => ({
        value: type.id,
        label: type.name,
      })) || [],
    },
    {
      name: 'description',
      label: 'Description', 
      type: 'textarea',
      placeholder: 'Brief description...',
      rows: 3,
      nullable: true,
    },
  ]

  const initialData: Partial<CreateContentFormData> = {
    title: '',
    description: '',
    item_type: allContentTypes?.length > 0 ? allContentTypes[0].id : '',
  }

  return (
    <FormModal<CreateContentFormData>
      isOpen={true}
      onClose={onClose}
      title={parentId ? 'Add Child Content' : 'Add Content Item'}
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText="Create Item"
      submitColor="success"
      isLoading={createContentItem.isPending}
    />
  )
}