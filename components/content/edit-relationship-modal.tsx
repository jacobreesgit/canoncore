'use client'

import { useState } from 'react'
import { useUpdateContentLink, useRelationshipTypes } from '@/hooks/use-content-links'
import { BaseModal, VStack, HStack, ActionButton, Badge, Textarea } from '@/components/ui'
import { getOrganisationTypeName } from '@/lib/page-utils'
import type { ContentLinkWithItems } from '@/hooks/use-content-links'

interface EditRelationshipModalProps {
  relationship: ContentLinkWithItems
  onClose: () => void
}

export function EditRelationshipModal({
  relationship,
  onClose
}: EditRelationshipModalProps) {
  const [relationshipType, setRelationshipType] = useState(relationship.link_type)
  const [description, setDescription] = useState(relationship.description || '')
  
  const universeId = relationship.from_item.universe_id
  const { data: relationshipTypes } = useRelationshipTypes(universeId)
  const updateRelationshipMutation = useUpdateContentLink()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateRelationshipMutation.mutateAsync({
        id: relationship.id,
        link_type: relationshipType,
        description: description.trim() || null,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update relationship:', error)
    }
  }

  return (
    <BaseModal
      isOpen={true}
      title="Edit Relationship"
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing="lg">
          {/* Relationship preview */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-600 mb-2">Relationship between:</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" size="sm">
                  {getOrganisationTypeName(relationship.from_item.item_type)}
                </Badge>
                <span className="font-medium">{relationship.from_item.title}</span>
              </div>
              <div className="text-center text-gray-400 text-sm">↓</div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" size="sm">
                  {getOrganisationTypeName(relationship.to_item.item_type)}
                </Badge>
                <span className="font-medium">{relationship.to_item.title}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
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

          <Textarea
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add additional context about this relationship..."
            rows={3}
          />

          <HStack spacing="sm" className="justify-end">
            <ActionButton
              onClick={onClose}
              variant="secondary"
              disabled={updateRelationshipMutation.isPending}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              variant="primary"
              disabled={updateRelationshipMutation.isPending}
            >
              {updateRelationshipMutation.isPending ? 'Updating...' : 'Update Relationship'}
            </ActionButton>
          </HStack>

          {updateRelationshipMutation.error && (
            <div className="text-red-600 text-sm">
              Error: {updateRelationshipMutation.error.message}
            </div>
          )}
        </VStack>
      </form>
    </BaseModal>
  )
}