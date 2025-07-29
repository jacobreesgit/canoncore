'use client'

import { useState } from 'react'
import { useCreateContentLink, useContentLinks } from '@/hooks/use-content-links'
import { useContentItems } from '@/hooks/use-content-items'
import { VStack, HStack, ActionButton, Textarea } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'
import { ContentSelector } from './content-selector'
import { RelationshipTypeSelector } from './relationship-type-selector'
import { ErrorBoundary } from '@/components/error'
import type { ContentItemWithChildren } from '@/types/database'

type ContentItemWithPath = ContentItemWithChildren & { path?: string[] }

interface RelationshipFormProps {
  fromItemId: string
  universeId: string
  onSubmit?: () => void
  onCancel?: () => void
  showHierarchy?: boolean
}

export function RelationshipForm({
  fromItemId,
  universeId,
  onSubmit,
  onCancel,
  showHierarchy = false
}: RelationshipFormProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItemWithPath | null>(null)
  const [relationshipType, setRelationshipType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  const { data: contentItems } = useContentItems(universeId)
  const { data: existingLinks } = useContentLinks(fromItemId)
  const createRelationshipMutation = useCreateContentLink()
  const { showToast } = useToast()

  // Flatten content items for selection (exclude current item)
  const flattenItems = (items: ContentItemWithChildren[]): ContentItemWithChildren[] => {
    const flattened: ContentItemWithChildren[] = []
    
    const addItem = (item: ContentItemWithChildren) => {
      if (item.id !== fromItemId) {
        flattened.push(item)
      }
      if (item.children) {
        item.children.forEach(addItem)
      }
    }
    
    items.forEach(addItem)
    return flattened
  }

  const availableItems = contentItems ? flattenItems(contentItems) : []

  // Validation functions
  const validateRelationship = (): string[] => {
    const errors: string[] = []

    if (!selectedItem) {
      errors.push('Please select a content item to relate to')
    }

    if (!relationshipType) {
      errors.push('Please select a relationship type')
    }

    // Check for circular relationships (basic check)
    if (selectedItem && selectedItem.id === fromItemId) {
      errors.push('Cannot create a relationship with the same item')
    }

    // Check for duplicate relationships
    if (selectedItem && relationshipType && existingLinks) {
      const isDuplicate = existingLinks.some(link => 
        (link.from_item_id === fromItemId && link.to_item_id === selectedItem.id && link.link_type === relationshipType) ||
        (link.from_item_id === selectedItem.id && link.to_item_id === fromItemId && link.link_type === relationshipType)
      )
      
      if (isDuplicate) {
        errors.push('This relationship already exists between these items')
      }
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateRelationship()
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      showToast({
        title: 'Validation Error',
        message: errors[0],
        variant: 'error'
      })
      return
    }

    if (!selectedItem || !relationshipType) {
      return
    }

    try {
      await createRelationshipMutation.mutateAsync({
        from_item_id: fromItemId,
        to_item_id: selectedItem.id,
        link_type: relationshipType as any,
        description: description.trim() || undefined,
      })
      
      showToast({
        title: 'Relationship Created',
        message: `Successfully linked to "${selectedItem.title}"`,
        variant: 'success'
      })
      
      // Reset form
      setSelectedItem(null)
      setRelationshipType('')
      setDescription('')
      setValidationErrors([])
      
      onSubmit?.()
    } catch (error) {
      console.error('Failed to create relationship:', error)
      showToast({
        title: 'Error',
        message: 'Failed to create relationship. Please try again.',
        variant: 'error'
      })
    }
  }

  const handleCancel = () => {
    setSelectedItem(null)
    setRelationshipType('')
    setDescription('')
    setValidationErrors([])
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing="lg">
        {/* Content Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Content Item
          </label>
          <ErrorBoundary level="component" isolate>
            <ContentSelector
              items={availableItems}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              placeholder="Search for content to relate..."
              excludeIds={[fromItemId]}
              showHierarchy={showHierarchy}
            />
          </ErrorBoundary>
          {validationErrors.some(error => error.includes('content item')) && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.find(error => error.includes('content item'))}
            </p>
          )}
        </div>

        {/* Relationship Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship Type
          </label>
          <ErrorBoundary level="component" isolate>
            <RelationshipTypeSelector
              universeId={universeId}
              selectedType={relationshipType}
              onSelect={setRelationshipType}
              placeholder="Select relationship type..."
              showDescriptions={true}
            />
          </ErrorBoundary>
          {validationErrors.some(error => error.includes('relationship type')) && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.find(error => error.includes('relationship type'))}
            </p>
          )}
        </div>

        {/* Description Field */}
        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add additional context about this relationship..."
          rows={3}
          helpText="Provide more details about how these items are related"
        />

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following issues:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Duplicate Relationship Warning */}
        {selectedItem && relationshipType && existingLinks && (
          (() => {
            const existingRelationship = existingLinks.find(link => 
              (link.from_item_id === fromItemId && link.to_item_id === selectedItem.id) ||
              (link.from_item_id === selectedItem.id && link.to_item_id === fromItemId)
            )
            
            if (existingRelationship && existingRelationship.link_type !== relationshipType) {
              return (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Note:</span> These items already have a &ldquo;{existingRelationship.link_type}&rdquo; relationship. 
                    Creating this relationship will add an additional connection.
                  </p>
                </div>
              )
            }
            return null
          })()
        )}

        {/* Action Buttons */}
        <HStack spacing="sm" className="justify-end">
          <ActionButton
            onClick={handleCancel}
            variant="secondary"
            disabled={createRelationshipMutation.isPending}
          >
            Cancel
          </ActionButton>
          <ActionButton
            type="submit"
            variant="primary"
            disabled={
              !selectedItem || 
              !relationshipType || 
              createRelationshipMutation.isPending ||
              validationErrors.length > 0
            }
          >
            {createRelationshipMutation.isPending ? 'Creating...' : 'Create Relationship'}
          </ActionButton>
        </HStack>

        {/* Error Display */}
        {createRelationshipMutation.error && (
          <div className="text-red-600 text-sm">
            Error: {createRelationshipMutation.error.message}
          </div>
        )}
      </VStack>
    </form>
  )
}