'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ContentItemWithChildren } from '@/types/database'
import { ContentTreeItem } from './content-tree-item'
import { useReorderContentItems } from '@/hooks/use-content-items'

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
  const reorderMutation = useReorderContentItems()
  
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
    
    if (dropZoneId.includes('-child-drop-zone')) {
      // Dropped in child area - make it a child
      const parentId = dropZoneId.replace('-child-drop-zone', '')
      const parent = flatItems.find(item => item.id === parentId)
      if (parent) {
        newParentId = parentId
        newOrderIndex = (parent.children?.length || 0)
      }
    } else if (dropZoneId.includes('-before-drop-zone')) {
      // Dropped before an item
      const targetId = dropZoneId.replace('-before-drop-zone', '')
      const targetItem = flatItems.find(item => item.id === targetId)
      if (targetItem) {
        newParentId = targetItem.parent_id
        newOrderIndex = targetItem.order_index
      }
    } else if (dropZoneId.includes('-after-drop-zone')) {
      // Dropped after an item
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
          />
        ))}
      </div>
    </DndContext>
  )
}