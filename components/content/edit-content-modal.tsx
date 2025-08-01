'use client'

import { useState } from 'react'
import { useUpdateContentItem } from '@/hooks/use-content-items'
import { useAllOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { ContentItem } from '@/types/database'
import { FormModal, FormField } from '@/components/ui'
import { ManageOrganisationTypesModal } from './manage-organisation-types-modal'
import { ActionButton } from '@/components/ui'

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
  const { data: allOrganisationTypes } = useAllOrganisationTypes(item.universe_id)

  const handleSubmit = async (data: EditContentFormData) => {
    try {
      await updateContentItem.mutateAsync({
        id: item.id,
        title: data.title.trim(),
        description: data.description,
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

  const initialData: Partial<EditContentFormData> = {
    title: item.title,
    description: item.description || '',
    item_type: item.item_type,
  }

  const manageTypesButton = (
    <ActionButton
      type="button"
      onClick={() => setShowManageTypesModal(true)}
      variant="primary"
      size="sm"
      title="Manage organisation types"
    >
      ⚙️ Manage Types
    </ActionButton>
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
        submitColor="primary"
        isLoading={updateContentItem.isPending}
        extraActions={manageTypesButton}
      />
      
      {showManageTypesModal && (
        <ManageOrganisationTypesModal
          universeId={item.universe_id}
          onClose={() => setShowManageTypesModal(false)}
        />
      )}
    </>
  )
}