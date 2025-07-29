'use client'

import { useState, useMemo } from 'react'
import { Badge, Input, ActionButton, HStack, VStack } from '@/components/ui'
import { getOrganisationTypeName } from '@/lib/page-utils'
import type { ContentItemWithChildren } from '@/types/database'

type ContentItemWithPath = ContentItemWithChildren & { path?: string[] }

interface ContentSelectorProps {
  items: ContentItemWithChildren[]
  selectedItem: ContentItemWithPath | null
  onSelect: (item: ContentItemWithPath | null) => void
  placeholder?: string
  disabled?: boolean
  excludeIds?: string[]
  showHierarchy?: boolean
}

export function ContentSelector({
  items,
  selectedItem,
  onSelect,
  placeholder = "Select content item...",
  disabled = false,
  excludeIds = [],
  showHierarchy = false
}: ContentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Flatten and filter items
  const flattenedItems = useMemo(() => {
    const flattenItems = (items: ContentItemWithChildren[], parentPath: string[] = []): Array<ContentItemWithChildren & { path: string[] }> => {
      const flattened: Array<ContentItemWithChildren & { path: string[] }> = []
      
      const addItem = (item: ContentItemWithChildren, currentPath: string[]) => {
        if (!excludeIds.includes(item.id)) {
          flattened.push({ ...item, path: currentPath })
        }
        if (item.children) {
          item.children.forEach(child => addItem(child, [...currentPath, item.title]))
        }
      }
      
      items.forEach(item => addItem(item, parentPath))
      return flattened
    }
    
    return flattenItems(items)
  }, [items, excludeIds])

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return flattenedItems
    
    const term = searchTerm.toLowerCase()
    return flattenedItems.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.item_type.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      item.path.some(pathItem => pathItem.toLowerCase().includes(term))
    )
  }, [flattenedItems, searchTerm])

  // Get recent items (last 5 unique items, excluding current selection and excluded items)
  const recentItems = useMemo(() => {
    // For now, just return first 5 items as "recent"
    // In a real implementation, this would come from user interaction history
    return flattenedItems.slice(0, 5).filter(item => 
      item.id !== selectedItem?.id && !excludeIds.includes(item.id)
    )
  }, [flattenedItems, selectedItem, excludeIds])

  const handleSelect = (item: ContentItemWithPath) => {
    onSelect(item)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onSelect(null)
    setIsOpen(false)
    setSearchTerm('')
  }

  const renderBreadcrumb = (path: string[]) => {
    if (!showHierarchy || path.length === 0) return null
    
    return (
      <div className="text-xs text-gray-500 mt-1">
        {path.join(' › ')}
      </div>
    )
  }

  if (disabled) {
    return (
      <div className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-500">
        {placeholder}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Selected item display / trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent flex items-center justify-between"
      >
        <span className="flex-1">
          {selectedItem ? (
            <VStack spacing="xs">
              <HStack spacing="sm" align="center">
                <Badge variant="secondary" size="sm">
                  {getOrganisationTypeName(selectedItem.item_type)}
                </Badge>
                <span className="font-medium">{selectedItem.title}</span>
              </HStack>
              {showHierarchy && selectedItem.path && renderBreadcrumb(selectedItem.path)}
            </VStack>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <svg 
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search content items..."
              autoFocus
              prefixIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Clear selection option */}
            {selectedItem && (
              <>
                <ActionButton
                  onClick={handleClear}
                  variant="danger"
                  size="sm"
                  className="w-full justify-start border-b border-gray-100 rounded-none"
                >
                  Clear selection
                </ActionButton>
                <div className="border-b border-gray-200" />
              </>
            )}

            {/* Recent items section (only show if no search term) */}
            {!searchTerm && recentItems.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Recent Items
                </div>
                {recentItems.map((item) => (
                  <ActionButton
                    key={`recent-${item.id}`}
                    onClick={() => handleSelect(item)}
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start border-b border-gray-100 last:border-b-0 rounded-none"
                  >
                    <div className="text-left w-full">
                      <HStack spacing="sm" align="center">
                        <Badge variant="secondary" size="sm">
                          {getOrganisationTypeName(item.item_type)}
                        </Badge>
                        <span className="font-medium text-gray-900">{item.title}</span>
                      </HStack>
                      {showHierarchy && renderBreadcrumb(item.path)}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </ActionButton>
                ))}
                <div className="border-b border-gray-200" />
              </>
            )}

            {/* All items section */}
            {!searchTerm && (
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                All Items
              </div>
            )}
            
            {filteredItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500 text-sm">
                {searchTerm ? 'No items match your search' : 'No items available'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <ActionButton
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  variant={selectedItem?.id === item.id ? 'primary' : 'secondary'}
                  size="sm"
                  className={`w-full justify-start border-b border-gray-100 last:border-b-0 rounded-none ${
                    selectedItem?.id === item.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-left w-full">
                    <HStack spacing="sm" align="center">
                      <Badge variant="secondary" size="sm">
                        {getOrganisationTypeName(item.item_type)}
                      </Badge>
                      <span className="font-medium text-gray-900">{item.title}</span>
                    </HStack>
                    {showHierarchy && renderBreadcrumb(item.path)}
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </ActionButton>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}