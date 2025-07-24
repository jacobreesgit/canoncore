'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ContentItemWithChildren } from '@/types/database'
import { ContentTreeItem } from './content-tree-item'
import { BulkDeleteModal } from './bulk-delete-modal'
import { BulkMoveModal } from './bulk-move-modal'
import { useReorderContentItems } from '@/hooks/use-content-items'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { ActionButton } from './ui/action-button'

interface ContentTreeProps {
  items: ContentItemWithChildren[]
  universeId: string
  universeSlug: string
}

// Helper function to flatten tree structure for easier manipulation
function flattenTree(items: ContentItemWithChildren[]): ContentItemWithChildren[] {
  const result: ContentItemWithChildren[] = []
  
  function traverse(items: ContentItemWithChildren[]) {
    items.forEach(item => {
      result.push(item)
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    })
  }
  
  traverse(items)
  return result
}

// Helper function to get selected items from tree
function getSelectedItems(items: ContentItemWithChildren[], selectedIds: Set<string>): ContentItemWithChildren[] {
  return flattenTree(items).filter(item => selectedIds.has(item.id))
}

// Helper function to rebuild tree structure from flat array
function buildTree(flatItems: ContentItemWithChildren[]): ContentItemWithChildren[] {
  const itemsMap = new Map<string, ContentItemWithChildren>()
  const rootItems: ContentItemWithChildren[] = []

  // Create map and reset children
  flatItems.forEach(item => {
    itemsMap.set(item.id, { ...item, children: [] })
  })

  // Build hierarchy
  flatItems.forEach(item => {
    const itemWithChildren = itemsMap.get(item.id)!
    if (item.parent_id) {
      const parent = itemsMap.get(item.parent_id)
      if (parent) {
        parent.children!.push(itemWithChildren)
      }
    } else {
      rootItems.push(itemWithChildren)
    }
  })

  return rootItems
}

export function ContentTree({ items, universeId, universeSlug }: ContentTreeProps) {
  const [localItems, setLocalItems] = useState(items)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false)
  const reorderMutation = useReorderContentItems()
  const bulkSelection = useBulkSelection()
  
  // Update local items when props change (using useEffect would be better)
  if (JSON.stringify(localItems) !== JSON.stringify(items)) {
    setLocalItems(items)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const flatItems = flattenTree(localItems)
    const activeItem = flatItems.find(item => item.id === active.id)

    if (!activeItem) {
      return
    }

    // Determine new parent and order index
    let newParentId: string | null = null
    let newOrderIndex = 0

    const dropZoneId = over.id.toString()
    
    if (dropZoneId.includes('-before-drop-zone')) {
      // Dropped before an item - reorder
      const targetId = dropZoneId.replace('-before-drop-zone', '')
      const targetItem = flatItems.find(item => item.id === targetId)
      if (targetItem) {
        newParentId = targetItem.parent_id
        newOrderIndex = targetItem.order_index
      }
    } else if (dropZoneId.includes('-after-drop-zone')) {
      // Dropped after an item - reorder
      const targetId = dropZoneId.replace('-after-drop-zone', '')
      const targetItem = flatItems.find(item => item.id === targetId)
      if (targetItem) {
        newParentId = targetItem.parent_id
        newOrderIndex = targetItem.order_index + 1
      }
    } else {
      // Dropped directly on an item - make it a child
      const overItem = flatItems.find(item => item.id === over.id)
      if (overItem) {
        newParentId = overItem.id
        newOrderIndex = (overItem.children?.length || 0)
      }
    }

    // Update order indices for affected items
    const updates: Array<{ id: string; order_index: number; parent_id: string | null }> = []
    
    // First, add the moved item
    updates.push({
      id: activeItem.id,
      order_index: newOrderIndex,
      parent_id: newParentId
    })

    // Then update siblings in the target parent
    const siblings = flatItems.filter(item => 
      item.parent_id === newParentId && item.id !== activeItem.id
    ).sort((a, b) => a.order_index - b.order_index)

    siblings.forEach((sibling, index) => {
      const adjustedIndex = index >= newOrderIndex ? index + 1 : index
      if (sibling.order_index !== adjustedIndex) {
        updates.push({
          id: sibling.id,
          order_index: adjustedIndex,
          parent_id: sibling.parent_id
        })
      }
    })

    // Apply updates to backend
    try {
      await reorderMutation.mutateAsync({
        universeId,
        updates
      })
    } catch (error) {
      console.error('Failed to reorder items:', error)
    }
  }, [localItems, universeId, reorderMutation])

  return (
    <div>
      {/* Bulk Operations Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!bulkSelection.isSelectionMode ? (
            <ActionButton
              onClick={bulkSelection.enterSelectionMode}
              variant="primary"
              size="sm"
            >
              Select
            </ActionButton>
          ) : (
            <>
              <ActionButton
                onClick={bulkSelection.exitSelectionMode}
                variant="info"
                size="sm"
              >
                Cancel Selection
              </ActionButton>
              <ActionButton
                onClick={() => bulkSelection.selectAll(localItems)}
                variant="primary"
                size="sm"
              >
                Select All
              </ActionButton>
              <ActionButton
                onClick={bulkSelection.clearSelection}
                variant="info"
                size="sm"
              >
                Clear All
              </ActionButton>
            </>
          )}
        </div>
        
        {bulkSelection.isSelectionMode && bulkSelection.selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {bulkSelection.selectedCount} selected
            </span>
            <ActionButton
              onClick={() => setShowBulkMoveModal(true)}
              variant="success"
              size="sm"
            >
              Move Selected
            </ActionButton>
            <ActionButton
              onClick={() => setShowBulkDeleteModal(true)}
              variant="danger"
              size="sm"
            >
              Delete Selected
            </ActionButton>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-2">
          {localItems.map((item) => (
            <ContentTreeItem
              key={item.id}
              item={item}
              universeId={universeId}
              universeSlug={universeSlug}
              level={0}
              bulkSelection={bulkSelection}
            />
          ))}
        </div>
      </DndContext>
      
      {showBulkMoveModal && (
        <BulkMoveModal
          selectedItems={getSelectedItems(localItems, bulkSelection.selectedItems)}
          allItems={localItems}
          universeId={universeId}
          onClose={() => setShowBulkMoveModal(false)}
          onComplete={() => {
            bulkSelection.exitSelectionMode()
            setShowBulkMoveModal(false)
          }}
        />
      )}
      
      {showBulkDeleteModal && (
        <BulkDeleteModal
          selectedItems={getSelectedItems(localItems, bulkSelection.selectedItems)}
          onClose={() => setShowBulkDeleteModal(false)}
          onComplete={() => {
            bulkSelection.exitSelectionMode()
            setShowBulkDeleteModal(false)
          }}
        />
      )}
    </div>
  )
}