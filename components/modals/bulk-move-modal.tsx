'use client'

import { useState } from 'react'
import { ContentItemWithChildren } from '@/types/database'
import { useReorderContentItems } from '@/hooks/use-content-items'
import { flattenTree } from '@/hooks/use-drag-drop'
import { BaseModal, VStack, HStack } from '@/components/ui'
import { ActionButton } from '@/components/ui'

interface BulkMoveModalProps {
  selectedItems: ContentItemWithChildren[]
  allItems: ContentItemWithChildren[]
  universeId: string
  onClose: () => void
  onComplete: () => void
}

export function BulkMoveModal({ selectedItems, allItems, universeId, onClose, onComplete }: BulkMoveModalProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>('root')
  const [isMoving, setIsMoving] = useState(false)
  const reorderMutation = useReorderContentItems()

  // Get all possible destinations (items that aren't selected and aren't children of selected items)
  const getAvailableDestinations = (): ContentItemWithChildren[] => {
    const selectedIds = new Set(selectedItems.map(item => item.id))
    
    // Recursively check if an item is a descendant of any selected item
    const isDescendantOfSelected = (item: ContentItemWithChildren): boolean => {
      const checkParent = (currentItem: ContentItemWithChildren): boolean => {
        if (!currentItem.parent_id) return false
        if (selectedIds.has(currentItem.parent_id)) return true
        
        const parent = flattenTree(allItems).find(i => i.id === currentItem.parent_id)
        return parent ? checkParent(parent) : false
      }
      
      return checkParent(item)
    }
    
    return flattenTree(allItems).filter(item => 
      !selectedIds.has(item.id) && !isDescendantOfSelected(item)
    )
  }

  const availableDestinations = getAvailableDestinations()

  const handleMove = async () => {
    setIsMoving(true)
    
    try {
      const updates: Array<{ id: string; order_index: number; parent_id: string | null }> = []
      
      // Get the new parent and calculate order indices
      const newParentId = selectedDestination === 'root' ? null : selectedDestination
      
      // Get existing children count for the destination
      let baseOrderIndex = 0
      if (newParentId) {
        const parent = flattenTree(allItems).find(item => item.id === newParentId)
        baseOrderIndex = parent?.children?.length || 0
      } else {
        // Count root level items
        baseOrderIndex = allItems.length
      }
      
      // Add updates for selected items
      selectedItems.forEach((item, index) => {
        updates.push({
          id: item.id,
          order_index: baseOrderIndex + index,
          parent_id: newParentId
        })
      })
      
      await reorderMutation.mutateAsync({
        universeId,
        updates
      })
      
      onComplete()
      onClose()
    } catch (error) {
      console.error('Failed to move items:', error)
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Move Multiple Items"
      size="md"
    >
      <VStack spacing="lg">
        <p className="text-gray-700">
          Moving <strong>{selectedItems.length}</strong> selected item{selectedItems.length !== 1 ? 's' : ''} to:
        </p>
        
        <VStack spacing="sm">
          <HStack spacing="sm" align="center" as="label">
            <input
              type="radio"
              name="destination"
              value="root"
              checked={selectedDestination === 'root'}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="font-medium">Root Level</span>
          </HStack>
          
          {availableDestinations.map(item => (
            <HStack key={item.id} spacing="sm" align="center" as="label">
              <input
                type="radio"
                name="destination"
                value={item.id}
                checked={selectedDestination === item.id}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="truncate">
                {'  '.repeat((item.parent_id ? getItemDepth(item, allItems) : 0))}
                {item.title}
              </span>
            </HStack>
          ))}
        </VStack>
        
        {availableDestinations.length === 0 && (
          <p className="text-gray-500 text-sm">
            No available destinations. All items are either selected or would create circular references.
          </p>
        )}

        <HStack spacing="sm" className="pt-4">
          <ActionButton
            onClick={handleMove}
            disabled={isMoving || availableDestinations.length === 0}
            isLoading={isMoving}
            variant="primary"
            className="flex-1"
          >
            {isMoving ? 'Moving...' : `Move ${selectedItems.length} Items`}
          </ActionButton>
          <ActionButton
            onClick={onClose}
            disabled={isMoving}
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

// Helper function
function getItemDepth(item: ContentItemWithChildren, allItems: ContentItemWithChildren[]): number {
  if (!item.parent_id) return 0
  
  const parent = flattenTree(allItems).find(i => i.id === item.parent_id)
  return parent ? 1 + getItemDepth(parent, allItems) : 0
}