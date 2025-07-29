'use client'

import { ContentItemWithChildren } from '@/types/database'
import { useBulkOperations } from '@/hooks/use-bulk-operations'
import { BulkOperationModal, BulkOperationHelpers } from '@/components/shared/bulk-operation-modal'

interface BulkDeleteModalProps {
  selectedItems: ContentItemWithChildren[]
  onClose: () => void
  onComplete: () => void
}

export function BulkDeleteModal({ selectedItems, onClose, onComplete }: BulkDeleteModalProps) {
  const { deleteItems, isProcessing, statistics } = useBulkOperations({
    selectedItems,
    allItems: [], // Not needed for delete operations
    universeId: selectedItems[0]?.universe_id || '',
    onComplete: (result) => {
      if (result.successCount > 0) {
        onComplete()
        onClose()
      }
    }
  })

  const handleDelete = async () => {
    await deleteItems()
  }

  const warningMessage = statistics.hasNestedItems
    ? `This will also delete all child items (${statistics.totalAffectedCount} total items). This action cannot be undone.`
    : 'This action cannot be undone.'

  return (
    <BulkOperationModal
      isOpen={true}
      onClose={onClose}
      title="Delete Multiple Items"
      selectedItems={selectedItems}
      onConfirm={handleDelete}
      confirmText={`Delete ${selectedItems.length} Item${selectedItems.length !== 1 ? 's' : ''}`}
      confirmVariant="danger"
      isLoading={isProcessing}
      showSelectionSummary={true}
      warningMessage={warningMessage}
    >
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <svg 
            className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <div className="text-sm">
            <p className="text-red-800 font-medium">
              You are about to permanently delete {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}.
            </p>
            {statistics.hasNestedItems && (
              <p className="text-red-700 mt-1">
                This includes {statistics.directChildrenCount} nested child item{statistics.directChildrenCount !== 1 ? 's' : ''} for a total of {statistics.totalAffectedCount} items.
              </p>
            )}
            <p className="text-red-700 mt-2 font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </BulkOperationModal>
  )
}