'use client'

import { useState } from 'react'
import { useCreateContentItem } from '@/hooks/use-content-items'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { FormModal, FormField } from './ui'
import { ManageContentTypesModal } from './manage-content-types-modal'

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
  const [showManageTypesModal, setShowManageTypesModal] = useState(false)
  
  const createContentItem = useCreateContentItem()
  const { data: allContentTypes } = useAllContentTypes(universeId)

  const handleSubmit = async (data: CreateContentFormData) => {
    try {
      await createContentItem.mutateAsync({
        title: data.title.trim(),
        description: data.description.trim() || undefined,
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

  const initialData: Partial<CreateContentFormData> = {
    title: '',
    description: '',
    item_type: allContentTypes?.length > 0 ? allContentTypes[0].id : '',
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
      <FormModal<CreateContentFormData>
        isOpen={true}
        onClose={onClose}
        title={parentId ? 'Add Child Content' : 'Add Content Item'}
        fields={fields}
        initialData={initialData}
        onSubmit={handleSubmit}
        submitText="Create Item"
        submitColor="green"
        isLoading={createContentItem.isPending}
        extraActions={manageTypesButton}
      />
      
      {showManageTypesModal && (
        <ManageContentTypesModal
          universeId={universeId}
          onClose={() => setShowManageTypesModal(false)}
        />
      )}
    </>
  )
}