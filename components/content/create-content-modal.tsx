'use client'

import { useCreateContentItem } from '@/hooks/use-content-items'
import { useAllOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { FormModal, FormField } from '@/components/ui'
import { ContentItemWithChildren } from '@/types/database'

interface CreateContentModalProps {
  universeId: string
  parentId?: string
  selectedItemsToWrap?: ContentItemWithChildren[]
  onClose: () => void
}

interface CreateContentFormData {
  title: string
  description: string
  item_type: string
}

export function CreateContentModal({ universeId, parentId, selectedItemsToWrap, onClose }: CreateContentModalProps) {
  const createContentItem = useCreateContentItem()
  const { data: allOrganisationTypes } = useAllOrganisationTypes(universeId)

  const handleSubmit = async (data: CreateContentFormData) => {
    try {
      await createContentItem.mutateAsync({
        title: data.title.trim(),
        description: data.description,
        item_type: data.item_type,
        universe_id: universeId,
        parent_id: parentId,
        selectedItemsToWrap,
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
      options: allOrganisationTypes?.map(type => ({
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
    item_type: allOrganisationTypes?.length > 0 ? allOrganisationTypes[0].id : '',
  }

  const getModalTitle = () => {
    if (selectedItemsToWrap) {
      return `Wrap ${selectedItemsToWrap.length} Items in Parent`
    }
    return parentId ? 'Add Child Content' : 'Add Content Item'
  }

  const getSubmitText = () => {
    if (selectedItemsToWrap) {
      return `Create Parent & Wrap ${selectedItemsToWrap.length} Items`
    }
    return 'Create Item'
  }

  return (
    <FormModal<CreateContentFormData>
      isOpen={true}
      onClose={onClose}
      title={getModalTitle()}
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText={getSubmitText()}
      submitColor="success"
      isLoading={createContentItem.isPending}
    />
  )
}