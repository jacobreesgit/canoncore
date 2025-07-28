'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ContentItem, ContentPlacement } from '@/types/database'
import { BaseModal, VStack, HStack, ActionButton, LoadingWrapper } from '@/components/ui'
import { useContentItems } from '@/hooks/use-content-items'
import { useToast } from '@/hooks/use-toast'

interface PlacementSelectorProps {
  universeId: string
  excludeId: string
  selectedParentId: string
  onParentSelect: (parentId: string) => void
  onConfirm: () => void
  onCancel: () => void
}

function PlacementSelector({ universeId, excludeId, selectedParentId, onParentSelect, onConfirm, onCancel }: PlacementSelectorProps) {
  const { data: contentItems } = useContentItems(universeId)
  
  // Flatten content items for parent selection
  const flattenItems = (items: any[]): any[] => {
    const flattened: any[] = []
    
    const addItem = (item: any) => {
      if (item.id !== excludeId) { // Don't allow placing under itself
        flattened.push(item)
      }
      if (item.children) {
        item.children.forEach(addItem)
      }
    }
    
    items.forEach(addItem)
    return flattened
  }

  const availableParents = contentItems ? flattenItems(contentItems) : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Select Parent Location</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose where to place this content. Select &ldquo;Root Level&rdquo; to place it at the top level.
          </p>
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
            {/* Root level option */}
            <button
              type="button"
              onClick={() => onParentSelect('root')}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 ${
                selectedParentId === 'root' ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <span className="font-medium text-purple-700">📁 Root Level</span>
              <p className="text-sm text-gray-600">Place at the top level of the hierarchy</p>
            </button>
            
            {availableParents.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onParentSelect(item.id)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                  selectedParentId === item.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <span className="font-medium text-gray-900">{item.title}</span>
                <p className="text-sm text-gray-600 capitalize">{item.item_type}</p>
              </button>
            ))}
          </div>
          
          <HStack spacing="sm" className="justify-end mt-4">
            <ActionButton onClick={onCancel} variant="secondary">
              Cancel
            </ActionButton>
            <ActionButton 
              onClick={onConfirm} 
              variant="primary"
              disabled={!selectedParentId}
            >
              Add Placement
            </ActionButton>
          </HStack>
        </div>
      </div>
    </div>
  )
}

interface ManagePlacementsModalProps {
  contentItem: ContentItem
  onClose: () => void
}

export function ManagePlacementsModal({ contentItem, onClose }: ManagePlacementsModalProps) {
  const [showAddPlacement, setShowAddPlacement] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const queryClient = useQueryClient()
  const toast = useToast()

  // Get all content items for parent selection
  const { data: contentItems } = useContentItems(contentItem.universe_id)

  // Get current placements for this content item
  const { data: placements, isLoading } = useQuery({
    queryKey: ['content-placements', contentItem.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_placements')
        .select(`
          *,
          parent:content_items!parent_id(id, title, slug)
        `)
        .eq('content_item_id', contentItem.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as (ContentPlacement & { parent: ContentItem | null })[]
    },
  })

  // Add placement mutation
  const addPlacementMutation = useMutation({
    mutationFn: async ({ parentId, orderIndex }: { parentId: string | null; orderIndex: number }) => {
      const { data, error } = await supabase
        .from('content_placements')
        .insert({
          content_item_id: contentItem.id,
          parent_id: parentId,
          order_index: orderIndex,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-placements', contentItem.id] })
      queryClient.invalidateQueries({ queryKey: ['content-items', contentItem.universe_id] })
      setShowAddPlacement(false)
    },
  })

  // Remove placement mutation
  const removePlacementMutation = useMutation({
    mutationFn: async (placementId: string) => {
      const { error } = await supabase
        .from('content_placements')
        .delete()
        .eq('id', placementId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-placements', contentItem.id] })
      queryClient.invalidateQueries({ queryKey: ['content-items', contentItem.universe_id] })
    },
  })

  const handleAddPlacement = async () => {
    const parentId = selectedParentId === 'root' ? null : selectedParentId

    // Get next order index for the parent
    const { data: siblingPlacements } = await supabase
      .from('content_placements')
      .select('order_index')
      .eq('parent_id', parentId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = siblingPlacements?.[0]?.order_index !== undefined 
      ? siblingPlacements[0].order_index + 1 
      : 0

    addPlacementMutation.mutate({
      parentId,
      orderIndex: nextOrderIndex,
    })
  }

  // Flatten content items for parent selection
  const flattenItems = (items: any[]): any[] => {
    const flattened: any[] = []
    
    const addItem = (item: any) => {
      if (item.id !== contentItem.id) { // Don't allow placing under itself
        flattened.push(item)
      }
      if (item.children) {
        item.children.forEach(addItem)
      }
    }
    
    items.forEach(addItem)
    return flattened
  }

  const availableParents = contentItems ? flattenItems(contentItems) : []

  const handleRemovePlacement = (placementId: string) => {
    if (placements && placements.length <= 1) {
      toast.warning(
        'Cannot Remove Placement',
        'Content must appear in at least one location.'
      )
      return
    }

    if (confirm('Are you sure you want to remove this placement?')) {
      removePlacementMutation.mutate(placementId)
    }
  }

  if (isLoading) {
    return (
      <BaseModal isOpen={true} onClose={onClose} title="Manage Placements">
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Loading placements..."
        >
          <div />
        </LoadingWrapper>
      </BaseModal>
    )
  }

  return (
    <BaseModal isOpen={true} onClose={onClose} title={`Manage Placements: ${contentItem.title}`} size="lg">
      <VStack spacing="lg">
        <div>
          <h3 className="text-lg font-medium mb-3">Current Placements</h3>
          <p className="text-sm text-gray-600 mb-4">
            This content currently appears in {placements?.length || 0} location(s) in the hierarchy.
          </p>
          
          {placements && placements.length > 0 ? (
            <VStack spacing="sm">
              {placements.map((placement) => (
                <div
                  key={placement.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <span className="font-medium">
                      {placement.parent ? placement.parent.title : 'Root Level'}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      (order: {placement.order_index})
                    </span>
                  </div>
                  <ActionButton
                    onClick={() => handleRemovePlacement(placement.id)}
                    disabled={removePlacementMutation.isPending || (placements.length <= 1)}
                    variant="danger"
                    size="sm"
                    title={placements.length <= 1 ? "Cannot remove the last placement" : "Remove from this location"}
                  >
                    Remove
                  </ActionButton>
                </div>
              ))}
            </VStack>
          ) : (
            <p className="text-gray-500 italic">No placements found.</p>
          )}
        </div>

        <div>
          <HStack justify="between" align="center" className="mb-3">
            <h3 className="text-lg font-medium">Add New Placement</h3>
            <ActionButton
              onClick={() => setShowAddPlacement(true)}
              variant="primary"
              size="sm"
              disabled={addPlacementMutation.isPending}
            >
              Add Placement
            </ActionButton>
          </HStack>
          <p className="text-sm text-gray-600">
            Choose a parent to add this content under. Select &ldquo;Root Level&rdquo; to place it at the top level.
          </p>
        </div>

        <HStack justify="end" spacing="sm">
          <ActionButton onClick={onClose} variant="secondary">
            Done
          </ActionButton>
        </HStack>
      </VStack>

      {showAddPlacement && (
        <PlacementSelector
          universeId={contentItem.universe_id}
          excludeId={contentItem.id}
          selectedParentId={selectedParentId}
          onParentSelect={setSelectedParentId}
          onConfirm={handleAddPlacement}
          onCancel={() => setShowAddPlacement(false)}
        />
      )}
    </BaseModal>
  )
}