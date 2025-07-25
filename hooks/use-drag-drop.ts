import { useCallback } from 'react'
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'

export interface DragDropItem {
  id: string
  parent_id?: string | null
  order_index: number
  [key: string]: any
}

export interface DragDropUpdate {
  id: string
  parent_id: string | null
  order_index: number
}

export interface DragDropConfig<T extends DragDropItem> {
  items: T[]
  onReorder: (updates: DragDropUpdate[]) => Promise<void>
  flattenItems?: (items: T[]) => T[]
  onDragStart?: (event: DragStartEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
}

export interface DragDropHandlers {
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
}

// Default flatten function for hierarchical items
function defaultFlattenItems<T extends DragDropItem>(items: T[]): T[] {
  const result: T[] = []
  
  function traverse(items: T[]) {
    items.forEach(item => {
      result.push(item)
      if ('children' in item && Array.isArray((item as any).children)) {
        traverse((item as any).children)
      }
    })
  }
  
  traverse(items)
  return result
}

export function useDragDrop<T extends DragDropItem>(config: DragDropConfig<T>): DragDropHandlers {
  const { items, onReorder, flattenItems = defaultFlattenItems, onDragStart, onDragOver, onDragEnd } = config

  const handleDragStart = useCallback((event: DragStartEvent) => {
    onDragStart?.(event)
  }, [onDragStart])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    onDragOver?.(event)
  }, [onDragOver])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    // Call custom onDragEnd handler first
    onDragEnd?.(event)

    if (!over || active.id === over.id) {
      return
    }

    const flatItems = flattenItems(items)
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
        newParentId = targetItem.parent_id || null
        newOrderIndex = targetItem.order_index
      }
    } else if (dropZoneId.includes('-after-drop-zone')) {
      // Dropped after an item - reorder
      const targetId = dropZoneId.replace('-after-drop-zone', '')
      const targetItem = flatItems.find(item => item.id === targetId)
      if (targetItem) {
        newParentId = targetItem.parent_id || null
        newOrderIndex = targetItem.order_index + 1
      }
    } else {
      // Dropped directly on an item - make it a child
      const overItem = flatItems.find(item => item.id === over.id)
      if (overItem) {
        newParentId = overItem.id
        // Count existing children to determine order index
        const childrenCount = flatItems.filter(item => item.parent_id === overItem.id).length
        newOrderIndex = childrenCount
      }
    }

    // Calculate updates for affected items
    const updates: DragDropUpdate[] = []
    
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
          parent_id: sibling.parent_id || null
        })
      }
    })

    // Apply updates
    try {
      await onReorder(updates)
    } catch (error) {
      console.error('Failed to reorder items:', error)
    }
  }, [items, flattenItems, onReorder, onDragEnd])

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd
  }
}

// Utility function for tree manipulation
export function flattenTree<T extends DragDropItem>(items: T[]): T[] {
  return defaultFlattenItems(items)
}

// Utility function to rebuild tree structure from flat array
export function buildTree<T extends DragDropItem>(flatItems: T[]): T[] {
  const itemsMap = new Map<string, T & { children?: T[] }>()
  const rootItems: (T & { children?: T[] })[] = []

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
        if (!parent.children) parent.children = []
        parent.children.push(itemWithChildren)
      }
    } else {
      rootItems.push(itemWithChildren)
    }
  })

  return rootItems as T[]
}