'use client'

import { useDeleteContentItem } from '@/hooks/use-content-items'
import { ContentItemWithChildren } from '@/types/database'

interface DeleteContentModalProps {
  item: ContentItemWithChildren
  onClose: () => void
}

export function DeleteContentModal({ item, onClose }: DeleteContentModalProps) {
  const deleteContentItem = useDeleteContentItem()

  const handleDelete = async () => {
    try {
      await deleteContentItem.mutateAsync(item.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete content item:', error)
    }
  }

  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Content Item</h2>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>"{item.title}"</strong>?
          </p>
          
          {hasChildren && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This item has {item.children!.length} child item{item.children!.length !== 1 ? 's' : ''}. 
                All child items will also be permanently deleted.
              </p>
            </div>
          )}
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. All versions and links for this item will be permanently deleted.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDelete}
              disabled={deleteContentItem.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {deleteContentItem.isPending ? 'Deleting...' : 'Delete Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}