'use client'

import { useMemo, useCallback } from 'react'
import { RadioGroup, VStack } from '@/components/ui'
import { flattenTree } from '@/hooks/use-drag-drop'
import type { ContentItemWithChildren } from '@/types/database'

interface DestinationOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

interface DestinationSelectorProps {
  selectedItems: ContentItemWithChildren[]
  allItems: ContentItemWithChildren[]
  selectedDestination: string
  onSelect: (destination: string) => void
  allowRoot?: boolean
  rootLabel?: string
  placeholder?: string
  disabled?: boolean
  showPreview?: boolean
}

export function DestinationSelector({
  selectedItems,
  allItems,
  selectedDestination,
  onSelect,
  allowRoot = true,
  rootLabel = 'Root Level',
  placeholder = 'Select destination...',
  disabled = false,
  showPreview = false
}: DestinationSelectorProps) {
  
  // Get all possible destinations (items that aren't selected and aren't children of selected items)
  const availableDestinations = useMemo((): ContentItemWithChildren[] => {
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
  }, [selectedItems, allItems])

  // Helper function to calculate item depth for indentation
  const getItemDepth = useCallback((item: ContentItemWithChildren): number => {
    if (!item.parent_id) return 0
    
    const parent = flattenTree(allItems).find(i => i.id === item.parent_id)
    return parent ? 1 + getItemDepth(parent) : 0
  }, [allItems])

  // Build destination options
  const destinationOptions: DestinationOption[] = useMemo(() => {
    const options: DestinationOption[] = []
    
    if (allowRoot) {
      options.push({
        value: 'root',
        label: rootLabel,
        description: 'Move to the top level of the universe'
      })
    }
    
    // Add available destinations with hierarchy indentation
    availableDestinations.forEach(item => {
      const depth = getItemDepth(item)
      const indent = '  '.repeat(depth)
      
      options.push({
        value: item.id,
        label: `${indent}${item.title}`,
        description: item.description || undefined
      })
    })
    
    return options
  }, [availableDestinations, allowRoot, rootLabel, getItemDepth])

  // Get preview information for the selected destination
  const getDestinationPreview = (): string | null => {
    if (!showPreview) return null
    
    if (selectedDestination === 'root') {
      const rootItemCount = allItems.filter(item => !item.parent_id).length
      return `Will be placed at position ${rootItemCount + 1} in the root level`
    }
    
    const destination = availableDestinations.find(item => item.id === selectedDestination)
    if (destination) {
      const childCount = destination.children?.length || 0
      return `Will be placed as child ${childCount + 1} under "${destination.title}"`
    }
    
    return null
  }

  const preview = getDestinationPreview()

  if (destinationOptions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-600 text-sm">
          No available destinations. All items are either selected or would create circular references.
        </p>
      </div>
    )
  }

  return (
    <VStack spacing="sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination
        </label>
        <RadioGroup
          name="destination"
          value={selectedDestination}
          onChange={onSelect}
          options={destinationOptions}
          layout="vertical"
          disabled={disabled}
        />
      </div>
      
      {preview && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Preview:</span> {preview}
          </p>
        </div>
      )}
      
      {destinationOptions.length > 10 && (
        <div className="text-xs text-gray-500">
          Showing {destinationOptions.length} available destinations
        </div>
      )}
    </VStack>
  )
}

// Helper functions that can be imported separately
export const DestinationSelectorHelpers = {
  /**
   * Validate if a destination is valid for the given selected items
   */
  validateDestination: (
    destination: string,
    selectedItems: ContentItemWithChildren[],
    allItems: ContentItemWithChildren[]
  ): { valid: boolean; error?: string } => {
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
  },

  /**
   * Calculate the order index for items being moved to a destination
   */
  calculateOrderIndex: (
    destination: string,
    allItems: ContentItemWithChildren[]
  ): number => {
    if (destination === 'root') {
      return allItems.filter(item => !item.parent_id).length
    }
    
    const destinationItem = flattenTree(allItems).find(item => item.id === destination)
    return destinationItem?.children?.length || 0
  },

  /**
   * Get the path string for a destination (for display purposes)
   */
  getDestinationPath: (
    destination: string,
    allItems: ContentItemWithChildren[]
  ): string => {
    if (destination === 'root') {
      return 'Root Level'
    }
    
    const item = flattenTree(allItems).find(i => i.id === destination)
    if (!item) return 'Unknown'
    
    const buildPath = (currentItem: ContentItemWithChildren): string[] => {
      if (!currentItem.parent_id) return [currentItem.title]
      
      const parent = flattenTree(allItems).find(i => i.id === currentItem.parent_id)
      if (parent) {
        return [...buildPath(parent), currentItem.title]
      }
      return [currentItem.title]
    }
    
    return buildPath(item).join(' › ')
  }
}