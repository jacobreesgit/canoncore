'use client'

import { useState } from 'react'
import { useUpdateContentItem } from '@/hooks/use-content-items'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { ContentItem } from '@/types/database'
import { FormModal, FormField } from './ui'
import { ManageContentTypesModal } from './manage-content-types-modal'

interface EditContentModalProps {
  item: ContentItem
  onClose: () => void
}

interface EditContentFormData {
  title: string
  description: string
  item_type: string
}

export function EditContentModal({ item, onClose }: EditContentModalProps) {
  const [showManageTypesModal, setShowManageTypesModal] = useState(false)
  
  const updateContentItem = useUpdateContentItem()
  const { data: allContentTypes } = useAllContentTypes(item.universe_id)

  const handleSubmit = async (data: EditContentFormData) => {
    try {
      await updateContentItem.mutateAsync({
        id: item.id,
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        item_type: data.item_type,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update content item:', error)
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
        emoji: type.emoji,
      })) || [],
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description...',
      rows: 3,
    },
  ]

  const initialData: Partial<EditContentFormData> = {
    title: item.title,
    description: item.description || '',
    item_type: item.item_type,
  }

  const manageTypesButton = (
    <button
      type="button"
      onClick={() => setShowManageTypesModal(true)}
      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
      title="Manage content types"
    >
      ⚙️ Manage Types
    </button>
  )

  return (
    <>
      <FormModal<EditContentFormData>
        isOpen={true}
        onClose={onClose}
        title="Edit Content Item"
        fields={fields}
        initialData={initialData}
        onSubmit={handleSubmit}
        submitText="Update Item"
        submitColor="blue"
        isLoading={updateContentItem.isPending}
        extraActions={manageTypesButton}
      />
      
      {showManageTypesModal && (
        <ManageContentTypesModal
          universeId={item.universe_id}
          onClose={() => setShowManageTypesModal(false)}
        />
      )}
    </>
  )
}