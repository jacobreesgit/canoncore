'use client'

import { useState, useCallback, useMemo } from 'react'
import { useReorderContentItems, useDeleteContentItem } from './use-content-items'
import { useToast } from './use-toast'
import { flattenTree } from './use-drag-drop'
import type { ContentItemWithChildren } from '@/types/database'

interface BulkOperationResult {
  success: boolean
  successCount: number
  errorCount: number
  errors: Array<{ itemId: string; itemTitle: string; error: string }>
}

interface UseBulkOperationsProps {
  selectedItems: ContentItemWithChildren[]
  allItems: ContentItemWithChildren[]
  universeId: string
  onComplete?: (result: BulkOperationResult) => void
}

export function useBulkOperations({
  selectedItems,
  allItems,
  universeId,
  onComplete
}: UseBulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [operation, setOperation] = useState<'move' | 'delete' | null>(null)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  
  const reorderMutation = useReorderContentItems()
  const deleteMutation = useDeleteContentItem()
  const { showToast } = useToast()

  // Validation helpers
  const validateSelection = useCallback(() => {
    if (selectedItems.length === 0) {
      return { valid: false, error: 'No items selected' }
    }
    return { valid: true }
  }, [selectedItems])

  const validateMoveDestination = useCallback((destination: string) => {
    if (!destination) {
      return { valid: false, error: 'No destination selected' }
    }

    if (destination === 'root') {
      return { valid: true }
    }

    const selectedIds = new Set(selectedItems.map(item => item.id))
    
    // Check if destination is one of the selected items
    if (selectedIds.has(destination)) {
      return { valid: false, error: 'Cannot move items to themselves' }
    }
    
    // Check if destination would create circular reference
    const destinationItem = flattenTree(allItems).find(item => item.id === destination)
    if (!destinationItem) {
      return { valid: false, error: 'Destination no longer exists' }
    }
    
    // Check if destination is a descendant of any selected item
    const isDescendant = (item: ContentItemWithChildren): boolean => {
      if (!item.parent_id) return false
      if (selectedIds.has(item.parent_id)) return true
      
      const parent = flattenTree(allItems).find(i => i.id === item.parent_id)
      return parent ? isDescendant(parent) : false
    }
    
    if (isDescendant(destinationItem)) {
      return { valid: false, error: 'Cannot move items into their own descendants' }
    }
    
    return { valid: true }
  }, [selectedItems, allItems])

  // Move operation
  const moveItems = useCallback(async (destination: string) => {
    const selectionValidation = validateSelection()
    if (!selectionValidation.valid) {
      showToast({
        title: 'Validation Error',
        message: selectionValidation.error!,
        variant: 'error'
      })
      return { success: false, successCount: 0, errorCount: selectedItems.length, errors: [] }
    }

    const destinationValidation = validateMoveDestination(destination)
    if (!destinationValidation.valid) {
      showToast({
        title: 'Invalid Destination',
        message: destinationValidation.error!,
        variant: 'error'
      })
      return { success: false, successCount: 0, errorCount: selectedItems.length, errors: [] }
    }

    setIsProcessing(true)
    setOperation('move')
    setProgress({ completed: 0, total: selectedItems.length })

    try {
      // Get the new parent and calculate order indices
      const newParentId = destination === 'root' ? null : destination
      
      // Get existing children count for the destination
      let baseOrderIndex = 0
      if (newParentId) {
        const parent = flattenTree(allItems).find(item => item.id === newParentId)
        baseOrderIndex = parent?.children?.length || 0
      } else {
        // Count root level items
        baseOrderIndex = allItems.filter(item => !item.parent_id).length
      }
      
      // Prepare updates for selected items
      const updates = selectedItems.map((item, index) => ({
        id: item.id,
        order_index: baseOrderIndex + index,
        parent_id: newParentId
      }))
      
      await reorderMutation.mutateAsync({
        universeId,
        updates
      })
      
      const result: BulkOperationResult = {
        success: true,
        successCount: selectedItems.length,
        errorCount: 0,
        errors: []
      }

      showToast({
        title: 'Items Moved',
        message: `Successfully moved ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}`,
        variant: 'success'
      })
      
      onComplete?.(result)
      return result
    } catch (error) {
      console.error('Failed to move items:', error)
      
      const result: BulkOperationResult = {
        success: false,
        successCount: 0,
        errorCount: selectedItems.length,
        errors: selectedItems.map(item => ({
          itemId: item.id,
          itemTitle: item.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }

      showToast({
        title: 'Move Failed',
        message: 'Failed to move items. Please try again.',
        variant: 'error'
      })
      
      onComplete?.(result)
      return result
    } finally {
      setIsProcessing(false)
      setOperation(null)
      setProgress({ completed: 0, total: 0 })
    }
  }, [selectedItems, allItems, universeId, validateSelection, validateMoveDestination, reorderMutation, showToast, onComplete])

  // Delete operation with progress tracking
  const deleteItems = useCallback(async () => {
    const validation = validateSelection()
    if (!validation.valid) {
      showToast({
        title: 'Validation Error',
        message: validation.error!,
        variant: 'error'
      })
      return { success: false, successCount: 0, errorCount: selectedItems.length, errors: [] }
    }

    setIsProcessing(true)
    setOperation('delete')
    setProgress({ completed: 0, total: selectedItems.length })

    const errors: Array<{ itemId: string; itemTitle: string; error: string }> = []
    let successCount = 0

    try {
      // Delete items with individual error handling
      for (const [index, item] of selectedItems.entries()) {
        try {
          await deleteMutation.mutateAsync({
            itemId: item.id,
            universeId: item.universe_id
          })
          successCount++
        } catch (error) {
          console.error(`Failed to delete item ${item.title}:`, error)
          errors.push({
            itemId: item.id,
            itemTitle: item.title,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        
        setProgress({ completed: index + 1, total: selectedItems.length })
      }
      
      const result: BulkOperationResult = {
        success: errors.length === 0,
        successCount,
        errorCount: errors.length,
        errors
      }

      if (result.success) {
        showToast({
          title: 'Items Deleted',
          message: `Successfully deleted ${successCount} item${successCount !== 1 ? 's' : ''}`,
          variant: 'success'
        })
      } else if (successCount > 0) {
        showToast({
          title: 'Partial Success',
          message: `Deleted ${successCount} items, ${errors.length} failed`,
          variant: 'warning'
        })
      } else {
        showToast({
          title: 'Delete Failed',
          message: 'Failed to delete any items. Please try again.',
          variant: 'error'
        })
      }
      
      onComplete?.(result)
      return result
    } catch (error) {
      console.error('Bulk delete operation failed:', error)
      
      const result: BulkOperationResult = {
        success: false,
        successCount,
        errorCount: selectedItems.length - successCount,
        errors: [
          ...errors,
          ...selectedItems.slice(successCount).map(item => ({
            itemId: item.id,
            itemTitle: item.title,
            error: 'Operation cancelled due to unexpected error'
          }))
        ]
      }

      showToast({
        title: 'Delete Failed',
        message: 'Bulk delete operation failed. Please try again.',
        variant: 'error'
      })
      
      onComplete?.(result)
      return result
    } finally {
      setIsProcessing(false)
      setOperation(null)
      setProgress({ completed: 0, total: 0 })
    }
  }, [selectedItems, validateSelection, deleteMutation, showToast, onComplete])

  // Calculate statistics
  const statistics = useMemo(() => {
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

    return {
      selectedCount: selectedItems.length,
      totalAffectedCount: totalCount,
      hasNestedItems: hasChildren,
      directChildrenCount: totalCount - selectedItems.length
    }
  }, [selectedItems])

  return {
    // State
    isProcessing,
    operation,
    progress,
    
    // Statistics
    statistics,
    
    // Operations
    moveItems,
    deleteItems,
    
    // Validation
    validateSelection,
    validateMoveDestination,
    
    // Utilities
    canMove: !isProcessing && selectedItems.length > 0,
    canDelete: !isProcessing && selectedItems.length > 0,
  }
}