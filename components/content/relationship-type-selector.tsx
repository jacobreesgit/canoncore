'use client'

import { useState } from 'react'
import { ActionButton, Badge, Input, HStack, VStack } from '@/components/ui'
import { useRelationshipTypes } from '@/hooks/use-content-links'

interface RelationshipType {
  value: string
  label: string
  description?: string
  isBuiltIn: boolean
  customId?: string
}

interface RelationshipTypeSelectorProps {
  universeId: string
  selectedType: string
  onSelect: (typeValue: string) => void
  placeholder?: string
  disabled?: boolean
  showDescriptions?: boolean
  allowCustom?: boolean
  onCreateCustom?: () => void
}

export function RelationshipTypeSelector({
  universeId,
  selectedType,
  onSelect,
  placeholder = "Select relationship type...",
  disabled = false,
  showDescriptions = true,
  allowCustom = false,
  onCreateCustom
}: RelationshipTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: relationshipTypes, isLoading } = useRelationshipTypes(universeId)

  // Filter types based on search term
  const filteredTypes = relationshipTypes?.filter(type => 
    type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  // Group types by built-in vs custom
  const builtInTypes = filteredTypes.filter(type => type.isBuiltIn)
  const customTypes = filteredTypes.filter(type => !type.isBuiltIn)

  const selectedTypeData = relationshipTypes?.find(type => type.value === selectedType)

  const handleSelect = (type: RelationshipType) => {
    onSelect(type.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onSelect('')
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleCreateCustom = () => {
    setIsOpen(false)
    onCreateCustom?.()
  }

  if (disabled) {
    return (
      <div className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-500">
        {placeholder}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-500">
        Loading relationship types...
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Selected type display / trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent flex items-center justify-between"
      >
        <span className="flex-1">
          {selectedTypeData ? (
            <HStack spacing="sm" align="center">
              <Badge 
                variant={selectedTypeData.isBuiltIn ? 'primary' : 'secondary'} 
                size="sm"
              >
                {selectedTypeData.isBuiltIn ? 'Built-in' : 'Custom'}
              </Badge>
              <span className="font-medium">{selectedTypeData.label}</span>
            </HStack>
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

      {/* Show selected type description */}
      {selectedTypeData && showDescriptions && selectedTypeData.description && (
        <p className="mt-1 text-sm text-gray-600">
          {selectedTypeData.description}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search relationship types..."
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
            {selectedType && (
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

            {/* Create custom type option */}
            {allowCustom && onCreateCustom && (
              <>
                <ActionButton
                  onClick={handleCreateCustom}
                  variant="primary"
                  size="sm"
                  className="w-full justify-start border-b border-gray-100 rounded-none"
                >
                  <HStack spacing="sm" align="center">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create custom relationship type</span>
                  </HStack>
                </ActionButton>
                <div className="border-b border-gray-200" />
              </>
            )}

            {/* Built-in types section */}
            {builtInTypes.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Built-in Types
                </div>
                {builtInTypes.map((type) => (
                  <ActionButton
                    key={type.value}
                    onClick={() => handleSelect(type)}
                    variant={selectedType === type.value ? 'primary' : 'secondary'}
                    size="sm"
                    className={`w-full justify-start border-b border-gray-100 last:border-b-0 rounded-none ${
                      selectedType === type.value ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-left w-full">
                      <VStack spacing="xs">
                        <HStack spacing="sm" align="center">
                          <Badge variant="primary" size="sm">Built-in</Badge>
                          <span className="font-medium text-gray-900">{type.label}</span>
                        </HStack>
                        {showDescriptions && type.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {type.description}
                          </p>
                        )}
                      </VStack>
                    </div>
                  </ActionButton>
                ))}
              </>
            )}

            {/* Custom types section */}
            {customTypes.length > 0 && (
              <>
                {builtInTypes.length > 0 && <div className="border-b border-gray-200" />}
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Custom Types
                </div>
                {customTypes.map((type) => (
                  <ActionButton
                    key={type.value}
                    onClick={() => handleSelect(type)}
                    variant={selectedType === type.value ? 'primary' : 'secondary'}
                    size="sm"
                    className={`w-full justify-start border-b border-gray-100 last:border-b-0 rounded-none ${
                      selectedType === type.value ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-left w-full">
                      <VStack spacing="xs">
                        <HStack spacing="sm" align="center">
                          <Badge variant="secondary" size="sm">Custom</Badge>
                          <span className="font-medium text-gray-900">{type.label}</span>
                        </HStack>
                        {showDescriptions && type.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {type.description}
                          </p>
                        )}
                      </VStack>
                    </div>
                  </ActionButton>
                ))}
              </>
            )}

            {/* No results */}
            {filteredTypes.length === 0 && (
              <div className="px-3 py-8 text-center text-gray-500 text-sm">
                {searchTerm ? 'No relationship types match your search' : 'No relationship types available'}
              </div>
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