'use client'

import { useState, useMemo } from 'react'
import { Badge, Input } from '@/components/ui'
import { getOrganisationTypeName } from '@/lib/page-utils'
import type { ContentItemWithChildren } from '@/types/database'

interface ContentItemSelectorProps {
  items: ContentItemWithChildren[]
  selectedItem: ContentItemWithChildren | null
  onSelect: (item: ContentItemWithChildren | null) => void
  placeholder?: string
  disabled?: boolean
}

export function ContentItemSelector({
  items,
  selectedItem,
  onSelect,
  placeholder = "Select content item...",
  disabled = false
}: ContentItemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items
    
    const term = searchTerm.toLowerCase()
    return items.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.item_type.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    )
  }, [items, searchTerm])

  const handleSelect = (item: ContentItemWithChildren) => {
    onSelect(item)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onSelect(null)
    setIsOpen(false)
    setSearchTerm('')
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
      >
        <span className="flex-1">
          {selectedItem ? (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" size="sm">
                {getOrganisationTypeName(selectedItem.item_type)}
              </Badge>
              <span className="font-medium">{selectedItem.title}</span>
            </div>
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
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
          </div>

          {/* Items list */}
          <div className="max-h-48 overflow-y-auto">
            {selectedItem && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 text-red-600 text-sm"
              >
                Clear selection
              </button>
            )}
            
            {filteredItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500 text-sm">
                {searchTerm ? 'No items match your search' : 'No items available'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    selectedItem?.id === item.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" size="sm">
                      {getOrganisationTypeName(item.item_type)}
                    </Badge>
                    <span className="font-medium text-gray-900">{item.title}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </button>
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