'use client'

import { useState } from 'react'
import { ContentItemWithChildren } from '@/types/database'
import { useDeleteContentItem } from '@/hooks/use-content-items'

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Delete Multiple Items
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            You are about to delete <strong>{selectedItems.length}</strong> selected item{selectedItems.length !== 1 ? 's' : ''}.
          </p>
          
          {hasChildren && (
            <p className="text-red-600 mb-2 text-sm">
              ⚠️ This will also delete all child items ({totalCount} total items).
            </p>
          )}
          
          <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
            <p className="text-sm font-medium text-gray-600 mb-2">Items to delete:</p>
            <ul className="text-sm space-y-1">
              {selectedItems.map(item => (
                <li key={item.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-1.5"></span>
                  <span className="truncate">{item.title}</span>
                  {item.children && item.children.length > 0 && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      (+{item.children.length} children)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-red-600 text-sm mt-3 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {isDeleting ? 'Deleting...' : `Delete ${selectedItems.length} Items`}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}