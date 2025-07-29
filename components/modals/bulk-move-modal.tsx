'use client'

import { useState } from 'react'
import { ContentItemWithChildren } from '@/types/database'
import { useBulkOperations } from '@/hooks/use-bulk-operations'
import { BulkOperationModal } from '@/components/shared/bulk-operation-modal'
import { DestinationSelector } from '@/components/shared/destination-selector'
import { ErrorBoundary } from '@/components/error'

interface BulkMoveModalProps {
  selectedItems: ContentItemWithChildren[]
  allItems: ContentItemWithChildren[]
  universeId: string
  onClose: () => void
  onComplete: () => void
}

export function BulkMoveModal({ 
  selectedItems, 
  allItems, 
  universeId, 
  onClose, 
  onComplete 
}: BulkMoveModalProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>('root')
  
  const { moveItems, isProcessing, statistics } = useBulkOperations({
    selectedItems,
    allItems,
    universeId,
    onComplete: (result) => {
      if (result.success) {
        onComplete()
        onClose()
      }
    }
  })

  const handleMove = async () => {
    await moveItems(selectedDestination)
  }

  return (
    <BulkOperationModal
      isOpen={true}
      onClose={onClose}
      title="Move Multiple Items"
      selectedItems={selectedItems}
      onConfirm={handleMove}
      confirmText={`Move ${selectedItems.length} Item${selectedItems.length !== 1 ? 's' : ''}`}
      confirmVariant="primary"
      isLoading={isProcessing}
      showSelectionSummary={true}
    >
      <ErrorBoundary level="component" isolate>
        <DestinationSelector
          selectedItems={selectedItems}
          allItems={allItems}
          selectedDestination={selectedDestination}
          onSelect={setSelectedDestination}
          allowRoot={true}
          showPreview={true}
          disabled={isProcessing}
        />
      </ErrorBoundary>
    </BulkOperationModal>
  )
}