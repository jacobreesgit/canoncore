'use client'

import { useState } from 'react'
import { useCreateContentLink, useRelationshipTypes } from '@/hooks/use-content-links'
import { useContentItems } from '@/hooks/use-content-items'
import { BaseModal, VStack, HStack, ActionButton, LoadingPlaceholder } from '@/components/ui'
import { ContentItemSelector } from '@/components/shared/content-item-selector'
import type { ContentItemWithChildren } from '@/types/database'

interface CreateRelationshipModalProps {
  fromItemId: string
  universeId: string
  onClose: () => void
}

export function CreateRelationshipModal({
  fromItemId,
  universeId,
  onClose
}: CreateRelationshipModalProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItemWithChildren | null>(null)
  const [relationshipType, setRelationshipType] = useState<string>('')
  const [description, setDescription] = useState('')
  
  const { data: contentItems, isLoading: itemsLoading } = useContentItems(universeId)
  const { data: relationshipTypes, isLoading: typesLoading } = useRelationshipTypes(universeId)
  const createRelationshipMutation = useCreateContentLink()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      onClose()
    } catch (error) {
      console.error('Failed to create relationship:', error)
    }
  }

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

  if (itemsLoading || typesLoading) {
    return (
      <BaseModal
        isOpen={true}
        title="Add Relationship"
        onClose={onClose}
        size="md"
      >
        <LoadingPlaceholder title="Loading content items..." />
      </BaseModal>
    )
  }

  return (
    <BaseModal
      isOpen={true}
      title="Add Relationship"
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing="lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Content Item
            </label>
            <ContentItemSelector
              items={availableItems}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              placeholder="Search for content to relate..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select relationship type...</option>
              {relationshipTypes?.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {relationshipType && relationshipTypes && (
              <p className="mt-1 text-sm text-gray-600">
                {relationshipTypes.find(t => t.value === relationshipType)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional context about this relationship..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <HStack spacing="sm" className="justify-end">
            <ActionButton
              onClick={onClose}
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
                createRelationshipMutation.isPending
              }
            >
              {createRelationshipMutation.isPending ? 'Creating...' : 'Create Relationship'}
            </ActionButton>
          </HStack>

          {createRelationshipMutation.error && (
            <div className="text-red-600 text-sm">
              Error: {createRelationshipMutation.error.message}
            </div>
          )}
        </VStack>
      </form>
    </BaseModal>
  )
}