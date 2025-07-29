'use client'

import { ReactNode } from 'react'
import { BaseModal, VStack, HStack, ActionButton } from '@/components/ui'
import type { ContentItemWithChildren } from '@/types/database'

interface BulkOperationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  selectedItems: ContentItemWithChildren[]
  onConfirm: () => void
  onCancel?: () => void
  confirmText: string
  confirmVariant?: 'primary' | 'danger' | 'secondary'
  isLoading?: boolean
  disabled?: boolean
  children: ReactNode
  showSelectionSummary?: boolean
  warningMessage?: string
  customSummary?: ReactNode
}

export function BulkOperationModal({
  isOpen,
  onClose,
  title,
  selectedItems,
  onConfirm,
  onCancel,
  confirmText,
  confirmVariant = 'primary',
  isLoading = false,
  disabled = false,
  children,
  showSelectionSummary = true,
  warningMessage,
  customSummary
}: BulkOperationModalProps) {
  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  const handleConfirm = () => {
    onConfirm()
  }

  // Count total items including children for operations that affect nested items
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

  const renderSelectionSummary = () => {
    if (customSummary) {
      return customSummary
    }

    if (!showSelectionSummary) {
      return null
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Selected Items ({selectedItems.length})
        </h4>
        <div className="space-y-1">
          {selectedItems.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center text-sm text-blue-700">
              <span className="font-medium">{item.title}</span>
              {item.children && item.children.length > 0 && (
                <span className="ml-2 text-blue-600">
                  (+{item.children.length} children)
                </span>
              )}
            </div>
          ))}
          {selectedItems.length > 5 && (
            <div className="text-sm text-blue-600 italic">
              ... and {selectedItems.length - 5} more items
            </div>
          )}
        </div>
        {hasChildren && totalCount > selectedItems.length && (
          <div className="mt-2 pt-2 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Total affected items:</span> {totalCount}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <VStack spacing="lg">
        {renderSelectionSummary()}
        
        {warningMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <svg 
                className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" 
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
              <p className="text-sm text-yellow-800">{warningMessage}</p>
            </div>
          </div>
        )}

        {children}

        <HStack spacing="sm" className="pt-4">
          <ActionButton
            onClick={handleConfirm}
            disabled={isLoading || disabled}
            isLoading={isLoading}
            variant={confirmVariant}
            className="flex-1"
          >
            {confirmText}
          </ActionButton>
          <ActionButton
            onClick={handleCancel}
            disabled={isLoading}
            variant="secondary" 
            className="flex-1"
          >
            Cancel
          </ActionButton>
        </HStack>
      </VStack>
    </BaseModal>
  )
}

// Helper functions that can be used by bulk operation implementations
export const BulkOperationHelpers = {
  /**
   * Count total items including all nested children
   */
  getTotalItemCount: (items: ContentItemWithChildren[]): number => {
    let count = 0
    items.forEach(item => {
      count += 1
      if (item.children && item.children.length > 0) {
        count += BulkOperationHelpers.getTotalItemCount(item.children)
      }
    })
    return count
  },

  /**
   * Check if any selected items have children
   */
  hasNestedItems: (items: ContentItemWithChildren[]): boolean => {
    return items.some(item => item.children && item.children.length > 0)
  },

  /**
   * Generate standard warning message for destructive operations
   */
  generateWarningMessage: (items: ContentItemWithChildren[], action: string = 'affect'): string => {
    const totalCount = BulkOperationHelpers.getTotalItemCount(items)
    const hasChildren = BulkOperationHelpers.hasNestedItems(items)
    
    if (hasChildren) {
      return `This will ${action} all child items (${totalCount} total items). This action cannot be undone.`
    }
    return 'This action cannot be undone.'
  },

  /**
   * Create display items with child count information
   */
  createDisplayItems: (items: ContentItemWithChildren[]) => {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      childCount: item.children ? item.children.length : 0,
      description: item.children && item.children.length > 0 ? `+${item.children.length} children` : undefined
    }))
  }
}