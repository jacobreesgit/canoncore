import { useMemo, useState, useCallback } from 'react'
import { useDragDrop, DragDropConfig, DragDropHandlers, DragDropItem, DragDropUpdate } from './use-drag-drop'
import { useListSelection, SelectionConfig, SelectionActions, SelectionState, SelectableItem } from './use-list-selection'
import { useListOperations, ListOperationsConfig, ListOperationsState, ListOperationsActions, SortableItem } from './use-list-operations'
import { useTreeOperations, TreeOperationsConfig, TreeOperationsState, TreeOperationsActions, TreeItem } from './use-tree-operations'

// Combined item interface that satisfies all requirements
export interface ListManagementItem extends DragDropItem, SelectableItem, SortableItem, TreeItem {
  id: string
  parent_id?: string | null
  order_index: number
  title: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface ListManagementConfig<T extends ListManagementItem> {
  items: T[]
  
  // Drag & Drop
  enableDragDrop?: boolean
  onReorder?: (updates: DragDropUpdate[]) => Promise<void>
  
  // Selection
  enableSelection?: boolean
  maxSelection?: number
  onSelectionChange?: (selectedItems: Set<string>, items: T[]) => void
  
  // Bulk Operations
  onBulkMove?: (selectedItems: T[], targetParentId: string | null) => Promise<void>
  onBulkDelete?: (selectedItems: T[]) => Promise<void>
  onBulkUpdate?: (selectedItems: T[], updates: Partial<T>) => Promise<void>
  
  // Operations (sort/filter/search)
  enableOperations?: boolean
  initialSort?: Parameters<typeof useListOperations>[0]['initialSort']
  initialFilters?: Parameters<typeof useListOperations>[0]['initialFilters']
  searchConfig?: Parameters<typeof useListOperations>[0]['searchConfig']
  
  // Tree
  enableTree?: boolean
  expandedNodes?: Set<string>
  onExpandedChange?: (expandedNodes: Set<string>) => void
  
  // View mode
  viewMode?: 'flat' | 'tree' | 'card'
  showTreeControls?: boolean
  showViewToggle?: boolean
}

export interface ListManagementState<T extends ListManagementItem> {
  // Core
  items: T[]
  displayItems: T[]
  viewMode: 'flat' | 'tree' | 'card'
  
  // Selection (when enabled)
  selection?: SelectionState
  
  // Operations (when enabled)
  operations?: ListOperationsState<T>
  
  // Tree (when enabled)
  tree?: TreeOperationsState<T>
}

export interface ListManagementActions<T extends ListManagementItem> {
  // Core
  setViewMode: (mode: 'flat' | 'tree' | 'card') => void
  
  // Drag & Drop (when enabled)
  dragDrop?: DragDropHandlers
  
  // Selection (when enabled)
  selectionActions?: SelectionActions<T> & {
    bulkMove?: (targetParentId: string | null) => Promise<void>
    bulkDelete?: () => Promise<void>
    bulkUpdate?: (updates: Partial<T>) => Promise<void>
  }
  
  // Operations (when enabled)
  operationsActions?: ListOperationsActions<T>
  
  // Tree (when enabled)
  treeActions?: TreeOperationsActions<T>
}

// Default flatten function that works for all item types
function flattenItems<T extends ListManagementItem>(items: T[]): T[] {
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

export function useListManagement<T extends ListManagementItem>(
  config: ListManagementConfig<T>
): ListManagementState<T> & ListManagementActions<T> {
  const {
    items,
    enableDragDrop = false,
    enableSelection = false,
    enableOperations = false,
    enableTree = false,
    viewMode: initialViewMode = 'flat',
    onReorder,
    onSelectionChange,
    onBulkMove,
    onBulkDelete,
    onBulkUpdate,
    maxSelection,
    initialSort,
    initialFilters,
    searchConfig,
    expandedNodes,
    onExpandedChange,
    showTreeControls = true,
  } = config

  const [viewMode, setViewMode] = useState<'flat' | 'tree' | 'card'>(initialViewMode)

  // Drag & Drop - always call with stable config
  const dragDropConfig: DragDropConfig<T> = {
    items: enableDragDrop && onReorder ? items : [],
    onReorder: onReorder || (async () => {}), // Provide a no-op function if not provided
    flattenItems,
  }
  
  const dragDrop = useDragDrop(dragDropConfig)

  // Selection & Bulk Operations - always call the hook with stable config
  const selectionConfig: SelectionConfig<T> = {
    items: enableSelection ? items : [],
    flattenItems,
    maxSelection,
    onSelectionChange,
  }

  const selectionHook = useListSelection(selectionConfig)

  // Enhanced selection with bulk operations
  const selection = useMemo(() => {
    if (!enableSelection || !selectionHook) return undefined

    const bulkMove = onBulkMove ? async (targetParentId: string | null) => {
      const selectedItems = selectionHook.getSelectedItems()
      if (selectedItems.length === 0) return
      
      await onBulkMove(selectedItems, targetParentId)
      selectionHook.clearSelection()
    } : undefined

    const bulkDelete = onBulkDelete ? async () => {
      const selectedItems = selectionHook.getSelectedItems()
      if (selectedItems.length === 0) return
      
      await onBulkDelete(selectedItems)
      selectionHook.clearSelection()
    } : undefined

    const bulkUpdate = onBulkUpdate ? async (updates: Partial<T>) => {
      const selectedItems = selectionHook.getSelectedItems()
      if (selectedItems.length === 0) return
      
      await onBulkUpdate(selectedItems, updates)
      selectionHook.clearSelection()
    } : undefined

    return {
      ...selectionHook,
      bulkMove,
      bulkDelete,
      bulkUpdate,
    }
  }, [selectionHook, onBulkMove, onBulkDelete, onBulkUpdate])

  // Operations (sort/filter/search) - always call with stable config
  const operationsConfig: ListOperationsConfig<T> = {
    items: enableOperations ? items : [],
    initialSort,
    initialFilters,
    searchConfig,
    flattenItems,
  }

  const operations = useListOperations(operationsConfig)

  // Tree operations - always call with stable config
  const treeConfig: TreeOperationsConfig<T> = {
    items: enableTree ? items : [],
    expandedNodes,
    onExpandedChange,
  }

  const tree = useTreeOperations(treeConfig)

  // Calculate display items based on enabled features and view mode
  const displayItems = useMemo(() => {
    let result = items

    // Apply operations first (sort/filter/search)
    if (operations && enableOperations) {
      result = operations.processedItems
    }

    // Apply view mode
    if (viewMode === 'tree' && tree && enableTree) {
      // Return tree structure (visible nodes) - cast to unknown first to handle type mismatch
      return tree.visibleNodes.map(node => {
        const { children, depth, path, hasChildren, isExpanded, ...item } = node
        return item as unknown as T
      })
    } else if (viewMode === 'card') {
      // Return flat structure for card view (same as flat but can be styled differently)
      return flattenItems(result)
    } else {
      // Return flat structure
      return flattenItems(result)
    }
  }, [items, operations, tree, viewMode, enableOperations, enableTree])

  // Actions
  const setViewModeAction = useCallback((mode: 'flat' | 'tree' | 'card') => {
    setViewMode(mode)
  }, [])

  return {
    // State
    items,
    displayItems,
    viewMode,
    selection: selection ? {
      selectedItems: selection.selectedItems,
      isSelectionMode: selection.isSelectionMode,
      selectedCount: selection.selectedCount,
      hasSelection: selection.hasSelection,
      isAllSelected: selection.isAllSelected,
    } : undefined,
    operations: enableOperations ? operations : undefined,
    tree: enableTree ? tree : undefined,

    // Actions
    setViewMode: setViewModeAction,
    dragDrop: enableDragDrop && onReorder ? dragDrop : undefined,
    selectionActions: selection,
    operationsActions: enableOperations ? operations : undefined,
    treeActions: enableTree ? tree : undefined,
  }
}

// Convenience hook for common content management scenarios
export function useContentListManagement<T extends ListManagementItem>(
  items: T[],
  onReorder: (updates: DragDropUpdate[]) => Promise<void>,
  options?: {
    enableBulkOperations?: boolean
    onBulkMove?: (selectedItems: T[], targetParentId: string | null) => Promise<void>
    onBulkDelete?: (selectedItems: T[]) => Promise<void>
    enableSearch?: boolean
    enableFilters?: boolean
    initialViewMode?: 'flat' | 'tree'
  }
) {
  const {
    enableBulkOperations = true,
    onBulkMove,
    onBulkDelete,
    enableSearch = true,
    enableFilters = true,
    initialViewMode = 'tree',
  } = options || {}

  return useListManagement({
    items,
    enableDragDrop: true,
    enableSelection: enableBulkOperations,
    enableOperations: enableSearch || enableFilters,
    enableTree: true,
    viewMode: initialViewMode,
    onReorder,
    onBulkMove,
    onBulkDelete,
    searchConfig: enableSearch ? {
      keys: ['title', 'description'],
      caseSensitive: false,
      exactMatch: false,
    } : undefined,
  })
}