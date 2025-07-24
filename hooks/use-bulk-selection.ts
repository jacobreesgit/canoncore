import { useState, useCallback } from 'react'
import { ContentItemWithChildren } from '@/types/database'

export function useBulkSelection() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback((items: ContentItemWithChildren[]) => {
    const flatItems = flattenItems(items)
    setSelectedItems(new Set(flatItems.map(item => item.id)))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true)
  }, [])

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false)
    clearSelection()
  }, [clearSelection])

  return {
    selectedItems,
    isSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    selectedCount: selectedItems.size,
  }
}

// Helper function to flatten tree structure
function flattenItems(items: ContentItemWithChildren[]): ContentItemWithChildren[] {
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