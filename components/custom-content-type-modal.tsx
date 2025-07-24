'use client'

import { useCreateCustomContentType, useUpdateCustomContentType, useDeleteCustomContentType } from '@/hooks/use-custom-content-types'
import { CustomContentType } from '@/types/database'
import { FormModal, FormField } from './ui'
import { EmojiPicker } from './ui/emoji-picker'

interface CustomContentTypeModalProps {
  universeId: string
  onClose: () => void
  editingType?: CustomContentType
}

interface CustomContentTypeFormData {
  name: string
  emoji: string
}

export function CustomContentTypeModal({ universeId, onClose, editingType }: CustomContentTypeModalProps) {
  const createType = useCreateCustomContentType()
  const updateType = useUpdateCustomContentType()
  const deleteType = useDeleteCustomContentType()

  const initialData: CustomContentTypeFormData = {
    name: editingType?.name || '',
    emoji: editingType?.emoji || '📄'
  }

  const handleSubmit = async (data: CustomContentTypeFormData) => {
    try {
      if (editingType) {
        await updateType.mutateAsync({
          id: editingType.id,
          name: data.name.trim(),
          emoji: data.emoji,
        })
      } else {
        await createType.mutateAsync({
          name: data.name.trim(),
          emoji: data.emoji,
          universeId,
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save custom content type:', error)
      throw error
    }
  }

  const handleDelete = async () => {
    if (!editingType) return
    
    try {
      await deleteType.mutateAsync({
        id: editingType.id,
        universeId: editingType.universe_id,
      })
      onClose()
    } catch (error) {
      console.error('Failed to delete custom content type:', error)
      throw error
    }
  }

  const isLoading = createType.isPending || updateType.isPending || deleteType.isPending

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'e.g., Video Game, Comic Book, Podcast',
      required: true
    },
    {
      name: 'emoji',
      label: 'Emoji',
      type: 'custom',
      customComponent: (value, onChange, error) => (
        <EmojiPicker
          value={value}
          onChange={onChange}
          disabled={isLoading}
          error={error}
        />
      )
    }
  ]

  return (
    <FormModal<CustomContentTypeFormData>
      isOpen={true}
      onClose={onClose}
      title={editingType ? 'Edit Custom Content Type' : 'Create Custom Content Type'}
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitText={editingType ? 'Update Type' : 'Create Type'}
      submitColor="primary"
      isLoading={isLoading}
      deleteAction={editingType ? {
        text: 'Delete',
        onDelete: handleDelete,
        isDeleting: deleteType.isPending
      } : undefined}
    />
  )
}