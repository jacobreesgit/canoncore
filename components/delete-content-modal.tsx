'use client'

import { useDeleteContentItem } from '@/hooks/use-content-items'
import { ContentItemWithChildren } from '@/types/database'
import { ConfirmationModal } from './ui'

interface DeleteContentModalProps {
  item: ContentItemWithChildren
  onClose: () => void
  onSuccess?: () => void
}

export function DeleteContentModal({ item, onClose, onSuccess }: DeleteContentModalProps) {
  const deleteContentItem = useDeleteContentItem()

  const handleDelete = async () => {
    try {
      await deleteContentItem.mutateAsync({ itemId: item.id, universeId: item.universe_id })
      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to delete content item:', error)
      throw error
    }
  }

  // Recursively count all nested descendants
  const countAllDescendants = (item: ContentItemWithChildren): number => {
    if (!item.children || item.children.length === 0) {
      return 0
    }

    let count = item.children.length
    for (const child of item.children) {
      count += countAllDescendants(child)
    }
    return count
  }

  const totalDescendants = countAllDescendants(item)
  const hasChildren = totalDescendants > 0

  const warningMessage = hasChildren
    ? `This item has ${totalDescendants} nested item${totalDescendants !== 1 ? 's' : ''} (including all children, grandchildren, etc.). All nested items and their versions/links will be permanently deleted.`
    : 'This action cannot be undone. All versions and links for this item will be permanently deleted.'

  return (
    <ConfirmationModal
      isOpen={true}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Content Item"
      message={`Are you sure you want to delete "${item.title}"?`}
      warningMessage={warningMessage}
      confirmText="Delete Item"
      confirmColor="danger"
      isLoading={deleteContentItem.isPending}
    />
  )
}
