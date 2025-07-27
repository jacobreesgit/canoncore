'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ContentLink } from '@/types/database'
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { useAllRelationshipTypes, BUILT_IN_RELATIONSHIP_TYPES } from './use-custom-relationship-types'

// Simplified relationship types - no bidirectional complexity

// Content link entity configuration
const contentLinkConfig: EntityConfig<ContentLink> = {
  tableName: 'content_links',
  queryKey: 'content-links',
  defaultSelect: `
    *,
    from_item:content_items!from_item_id(id, title, slug, item_type),
    to_item:content_items!to_item_id(id, title, slug, item_type)
  `,
  defaultOrder: { column: 'created_at', ascending: false },
}

// Enhanced content link type with populated item data
export interface ContentLinkWithItems extends ContentLink {
  from_item: {
    id: string
    title: string
    slug: string
    item_type: string
    universe_id: string
  }
  to_item: {
    id: string
    title: string
    slug: string
    item_type: string
    universe_id: string
  }
}

// Hook to fetch all relationships for a specific content item
export function useContentLinks(contentItemId: string) {
  return useQuery({
    queryKey: ['content-links', contentItemId],
    queryFn: async () => {
      // Get relationships where this item is the source OR target
      const { data, error } = await supabase
        .from('content_links')
        .select(`
          *,
          from_item:content_items!from_item_id(id, title, slug, item_type, universe_id),
          to_item:content_items!to_item_id(id, title, slug, item_type, universe_id)
        `)
        .or(`from_item_id.eq.${contentItemId},to_item_id.eq.${contentItemId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as unknown) as ContentLinkWithItems[]
    },
    enabled: Boolean(contentItemId),
  })
}

// Hook to fetch all relationships in a universe (for admin/overview purposes)
export function useUniverseContentLinks(universeId: string) {
  return useQuery({
    queryKey: ['universe-content-links', universeId],
    queryFn: async () => {
      // Get all relationships for content items in this universe
      const { data, error } = await supabase
        .from('content_links')
        .select(`
          *,
          from_item:content_items!from_item_id(id, title, slug, item_type, universe_id),
          to_item:content_items!to_item_id(id, title, slug, item_type, universe_id)
        `)
        .or(`from_item.universe_id.eq.${universeId},to_item.universe_id.eq.${universeId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as unknown) as ContentLinkWithItems[]
    },
    enabled: Boolean(universeId),
  })
}



// Hook to create content relationships (simplified - no bidirectional logic)
export function useCreateContentLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (linkData: {
      from_item_id: string
      to_item_id: string
      link_type: ContentLink['link_type']
      description?: string
    }) => {
      // Basic validation - just check for duplicates
      const { data: existingLink } = await supabase
        .from('content_links')
        .select('id')
        .eq('from_item_id', linkData.from_item_id)
        .eq('to_item_id', linkData.to_item_id)
        .eq('link_type', linkData.link_type)
        .single()

      if (existingLink) {
        throw new Error('This relationship already exists')
      }

      // Create the relationship
      const { data, error } = await supabase
        .from('content_links')
        .insert(linkData)
        .select()
        .single()

      if (error) throw error
      return data as ContentLink
    },
    onSuccess: (_, variables) => {
      // Invalidate queries for both items involved
      queryClient.invalidateQueries({ queryKey: ['content-links', variables.from_item_id] })
      queryClient.invalidateQueries({ queryKey: ['content-links', variables.to_item_id] })
      queryClient.invalidateQueries({ queryKey: ['content-links'] })
    },
  })
}

// Hook to update content relationships
export function useUpdateContentLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: Partial<ContentLink> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_links')
        .update(updateData)
        .eq('id', updateData.id)
        .select()
        .single()

      if (error) throw error
      return data as ContentLink
    },
    onSuccess: (data) => {
      // Invalidate queries for both items involved
      queryClient.invalidateQueries({ queryKey: ['content-links', data.from_item_id] })
      queryClient.invalidateQueries({ queryKey: ['content-links', data.to_item_id] })
      queryClient.invalidateQueries({ queryKey: ['content-links'] })
    },
  })
}

// Hook to delete content relationships (simplified)
export function useDeleteContentLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (linkId: string) => {
      // Get the link data for cache invalidation
      const { data: linkToDelete, error: fetchError } = await supabase
        .from('content_links')
        .select('from_item_id, to_item_id')
        .eq('id', linkId)
        .single()

      if (fetchError) throw fetchError

      // Delete the link
      const { error: deleteError } = await supabase
        .from('content_links')
        .delete()
        .eq('id', linkId)

      if (deleteError) throw deleteError

      return linkToDelete
    },
    onSuccess: (result) => {
      // Invalidate queries for both items involved
      queryClient.invalidateQueries({ queryKey: ['content-links', result.from_item_id] })
      queryClient.invalidateQueries({ queryKey: ['content-links', result.to_item_id] })
      queryClient.invalidateQueries({ queryKey: ['content-links'] })
    },
  })
}

// Hook to get relationship statistics for a content item
export function useContentLinkStats(contentItemId: string) {
  return useQuery({
    queryKey: ['content-link-stats', contentItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_links')
        .select('link_type')
        .or(`from_item_id.eq.${contentItemId},to_item_id.eq.${contentItemId}`)

      if (error) throw error

      // Count relationships by type
      const stats = data.reduce((acc: Record<string, number>, link) => {
        acc[link.link_type] = (acc[link.link_type] || 0) + 1
        return acc
      }, {})

      return {
        total: data.length,
        byType: stats,
      }
    },
    enabled: Boolean(contentItemId),
  })
}

// Utility function to get relationship direction and label
export function getRelationshipDisplay(
  link: ContentLinkWithItems, 
  currentItemId: string,
  relationshipTypes?: Array<{ value: string; label: string }>
): {
  isOutgoing: boolean
  relatedItem: ContentLinkWithItems['from_item'] | ContentLinkWithItems['to_item']
  displayType: string
  displayLabel: string
  direction: 'outgoing' | 'incoming'
} {
  const isOutgoing = link.from_item_id === currentItemId
  const relatedItem = isOutgoing ? link.to_item : link.from_item
  
  // Find the display label from relationship types
  const typeInfo = relationshipTypes?.find(t => t.value === link.link_type)
  const displayLabel = typeInfo?.label || link.link_type
  
  return {
    isOutgoing,
    relatedItem,
    displayType: link.link_type,
    displayLabel,
    direction: isOutgoing ? 'outgoing' : 'incoming',
  }
}




// Hook to get available relationship types for a universe (built-in + custom)
export function useRelationshipTypes(universeId: string) {
  return useAllRelationshipTypes(universeId)
}

// Static built-in relationship types for backward compatibility
export const RELATIONSHIP_TYPES = BUILT_IN_RELATIONSHIP_TYPES