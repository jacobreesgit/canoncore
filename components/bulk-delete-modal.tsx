'use client'

import { useState } from 'react'
import { ContentItemWithChildren } from '@/types/database'
import { useDeleteContentItem } from '@/hooks/use-content-items'
import { ConfirmationModal } from './ui'

interface BulkDeleteModalProps {
  selectedItems: ContentItemWithChildren[]
  onClose: () => void
  onComplete: () => void
}

export function BulkDeleteModal({ selectedItems, onClose, onComplete }: BulkDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteContentItem = useDeleteContentItem()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      // Delete items in parallel
      await Promise.all(
        selectedItems.map(item =>
          deleteContentItem.mutateAsync({
            itemId: item.id,
            universeId: item.universe_id
          })
        )
      )
      
      onComplete()
      onClose()
    } catch (error) {
      console.error('Failed to delete items:', error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  // Count total items including children
  const getTotalItemCount = (items: ContentItemWithChildren[]): number => {
    let count = 0
    items.forEach(item => {
      count += 1
      if (item.children && item.children.length > 0) {
        count += getTotalItemCount(item.children)
      }
    })
    return count
  }

  const totalCount = getTotalItemCount(selectedItems)
  const hasChildren = selectedItems.some(item => item.children && item.children.length > 0)

  const warningMessage = hasChildren
    ? `This will also delete all child items (${totalCount} total items). This action cannot be undone.`
    : 'This action cannot be undone.'

  const itemsForDisplay = selectedItems.map(item => ({
    title: item.title,
    children: item.children ? item.children.length : 0,
    description: item.children && item.children.length > 0 ? `+${item.children.length} children` : undefined
  }))

  return (
    <ConfirmationModal
      isOpen={true}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Multiple Items"
      message={`You are about to delete ${selectedItems.length} selected item${selectedItems.length !== 1 ? 's' : ''}.`}
      warningMessage={warningMessage}
      confirmText={`Delete ${selectedItems.length} Items`}
      confirmColor="red"
      isLoading={isDeleting}
      items={itemsForDisplay}
    />
  )
}