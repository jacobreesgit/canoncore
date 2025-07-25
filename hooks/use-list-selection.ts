import { useState, useCallback, useMemo } from 'react'

export interface SelectableItem {
  id: string
  [key: string]: any
}

export interface SelectionConfig<T extends SelectableItem> {
  items: T[]
  flattenItems?: (items: T[]) => T[]
  maxSelection?: number
  onSelectionChange?: (selectedItems: Set<string>, items: T[]) => void
}

export interface SelectionActions<T extends SelectableItem> {
  toggleSelection: (itemId: string) => void
  selectItem: (itemId: string) => void
  deselectItem: (itemId: string) => void
  selectAll: () => void
  selectMultiple: (itemIds: string[]) => void
  clearSelection: () => void
  enterSelectionMode: () => void
  exitSelectionMode: () => void
  isSelected: (itemId: string) => boolean
  getSelectedItems: () => T[]
}

export interface SelectionState {
  selectedItems: Set<string>
  isSelectionMode: boolean
  selectedCount: number
  hasSelection: boolean
  isAllSelected: boolean
}

// Default flatten function for hierarchical items
function defaultFlattenItems<T extends SelectableItem>(items: T[]): T[] {
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

export function useListSelection<T extends SelectableItem>(
  config: SelectionConfig<T>
): SelectionState & SelectionActions<T> {
  const { items, flattenItems = defaultFlattenItems, maxSelection, onSelectionChange } = config
  
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Memoized flat items list
  const flatItems = useMemo(() => flattenItems(items), [items, flattenItems])
  const flatItemIds = useMemo(() => new Set(flatItems.map(item => item.id)), [flatItems])

  // Clean up selection when items change (remove non-existent items)
  const cleanSelectedItems = useMemo(() => {
    const cleaned = new Set<string>()
    selectedItems.forEach(id => {
      if (flatItemIds.has(id)) {
        cleaned.add(id)
      }
    })
    return cleaned
  }, [selectedItems, flatItemIds])

  // Update selection if it was cleaned
  if (cleanSelectedItems.size !== selectedItems.size) {
    setSelectedItems(cleanSelectedItems)
  }

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        // Check max selection limit
        if (maxSelection && newSet.size >= maxSelection) {
          return prev // Don't add if at limit
        }
        newSet.add(itemId)
      }
      
      onSelectionChange?.(newSet, flatItems)
      return newSet
    })
  }, [flatItems, maxSelection, onSelectionChange])

  const selectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      if (prev.has(itemId)) return prev
      
      // Check max selection limit
      if (maxSelection && prev.size >= maxSelection) {
        return prev
      }
      
      const newSet = new Set(prev)
      newSet.add(itemId)
      onSelectionChange?.(newSet, flatItems)
      return newSet
    })
  }, [flatItems, maxSelection, onSelectionChange])

  const deselectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      if (!prev.has(itemId)) return prev
      
      const newSet = new Set(prev)
      newSet.delete(itemId)
      onSelectionChange?.(newSet, flatItems)
      return newSet
    })
  }, [flatItems, onSelectionChange])

  const selectAll = useCallback(() => {
    const itemsToSelect = maxSelection 
      ? flatItems.slice(0, maxSelection).map(item => item.id)
      : flatItems.map(item => item.id)
    
    const newSet = new Set(itemsToSelect)
    setSelectedItems(newSet)
    onSelectionChange?.(newSet, flatItems)
  }, [flatItems, maxSelection, onSelectionChange])

  const selectMultiple = useCallback((itemIds: string[]) => {
    const validIds = itemIds.filter(id => flatItemIds.has(id))
    const itemsToSelect = maxSelection 
      ? validIds.slice(0, maxSelection)
      : validIds
    
    const newSet = new Set(itemsToSelect)
    setSelectedItems(newSet)
    onSelectionChange?.(newSet, flatItems)
  }, [flatItems, flatItemIds, maxSelection, onSelectionChange])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
    onSelectionChange?.(new Set(), flatItems)
  }, [flatItems, onSelectionChange])

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true)
  }, [])

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false)
    clearSelection()
  }, [clearSelection])

  const isSelected = useCallback((itemId: string) => {
    return cleanSelectedItems.has(itemId)
  }, [cleanSelectedItems])

  const getSelectedItems = useCallback(() => {
    return flatItems.filter(item => cleanSelectedItems.has(item.id))
  }, [flatItems, cleanSelectedItems])

  // Computed state
  const selectedCount = cleanSelectedItems.size
  const hasSelection = selectedCount > 0
  const isAllSelected = selectedCount === flatItems.length && flatItems.length > 0

  return {
    // State
    selectedItems: cleanSelectedItems,
    isSelectionMode,
    selectedCount,
    hasSelection,
    isAllSelected,
    
    // Actions
    toggleSelection,
    selectItem,
    deselectItem,
    selectAll,
    selectMultiple,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    isSelected,
    getSelectedItems,
  }
}

// Specialized hook for bulk operations
export interface BulkOperationsConfig<T extends SelectableItem> extends SelectionConfig<T> {
  onBulkMove?: (selectedItems: T[], targetParentId: string | null) => Promise<void>
  onBulkDelete?: (selectedItems: T[]) => Promise<void>
  onBulkUpdate?: (selectedItems: T[], updates: Partial<T>) => Promise<void>
}

export interface BulkOperationsActions<T extends SelectableItem> {
  bulkMove: (targetParentId: string | null) => Promise<void>
  bulkDelete: () => Promise<void>
  bulkUpdate: (updates: Partial<T>) => Promise<void>
  canPerformBulkOperations: boolean
}

export function useBulkOperations<T extends SelectableItem>(
  config: BulkOperationsConfig<T>
): SelectionState & SelectionActions<T> & BulkOperationsActions<T> {
  const selection = useListSelection(config)
  const { onBulkMove, onBulkDelete, onBulkUpdate } = config

  const bulkMove = useCallback(async (targetParentId: string | null) => {
    const selectedItems = selection.getSelectedItems()
    if (selectedItems.length === 0 || !onBulkMove) return
    
    await onBulkMove(selectedItems, targetParentId)
    selection.clearSelection()
  }, [selection, onBulkMove])

  const bulkDelete = useCallback(async () => {
    const selectedItems = selection.getSelectedItems()
    if (selectedItems.length === 0 || !onBulkDelete) return
    
    await onBulkDelete(selectedItems)
    selection.clearSelection()
  }, [selection, onBulkDelete])

  const bulkUpdate = useCallback(async (updates: Partial<T>) => {
    const selectedItems = selection.getSelectedItems()
    if (selectedItems.length === 0 || !onBulkUpdate) return
    
    await onBulkUpdate(selectedItems, updates)
    selection.clearSelection()
  }, [selection, onBulkUpdate])

  const canPerformBulkOperations = selection.hasSelection

  return {
    ...selection,
    bulkMove,
    bulkDelete,
    bulkUpdate,
    canPerformBulkOperations,
  }
}