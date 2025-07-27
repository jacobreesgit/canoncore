import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ContentItem, ContentItemWithChildren } from '@/types/database'
import { updateCurrentVersionSnapshot } from './use-universe-versions'
import { v4 as uuidv4 } from 'uuid'

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'content-item'
}

// Ensure slug is unique within universe
async function ensureUniqueSlug(baseSlug: string, universeId: string, excludeId?: string): Promise<string> {
  let slug = baseSlug
  let counter = 0
  
  while (true) {
    const query = supabase
      .from('content_items')
      .select('id')
      .eq('slug', slug)
      .eq('universe_id', universeId)
      .limit(1)
    
    if (excludeId) {
      query.neq('id', excludeId)
    }
    
    const { data } = await query
    
    if (!data || data.length === 0) {
      return slug
    }
    
    counter++
    slug = `${baseSlug}-${counter}`
  }
}

export function useContentItems(universeId: string) {
  return useQuery({
    queryKey: ['content-items', universeId],
    queryFn: async () => {
      // First, get all content items in the universe
      const { data: contentItems, error: contentError } = await supabase
        .from('content_items')
        .select(`
          *,
          versions:content_versions(*)
        `)
        .eq('universe_id', universeId)

      if (contentError) throw contentError

      // Get all placements for this universe's content
      const contentIds = contentItems.map(item => item.id)
      const { data: placements, error: placementsError } = await supabase
        .from('content_placements')
        .select('*')
        .in('content_item_id', contentIds)
        .order('order_index', { ascending: true })

      if (placementsError) throw placementsError

      // Build hierarchical structure with multi-placement support
      const itemsMap = new Map<string, ContentItemWithChildren>()
      const rootItems: ContentItemWithChildren[] = []

      // First pass: create all items with placement count
      contentItems.forEach(item => {
        const placementCount = placements.filter(p => p.content_item_id === item.id).length
        const itemWithChildren: ContentItemWithChildren = {
          ...item,
          children: [],
          versions: item.versions || [],
          placementCount, // Add this info for UI
        }
        itemsMap.set(item.id, itemWithChildren)
      })

      // Second pass: build hierarchy using placements
      // Group placements by parent_id for easier processing
      const placementsByParent = new Map<string | null, typeof placements>()
      placements.forEach(placement => {
        const parentId = placement.parent_id
        if (!placementsByParent.has(parentId)) {
          placementsByParent.set(parentId, [])
        }
        placementsByParent.get(parentId)!.push(placement)
      })

      // Add children to their parents based on placements
      placementsByParent.forEach((parentPlacements, parentId) => {
        if (parentId === null) {
          // Root items (no parent)
          parentPlacements.forEach(placement => {
            const item = itemsMap.get(placement.content_item_id)
            if (item) {
              rootItems.push(item)
            }
          })
        } else {
          // Child items
          const parent = itemsMap.get(parentId)
          if (parent) {
            parentPlacements.forEach(placement => {
              const child = itemsMap.get(placement.content_item_id)
              if (child) {
                // Create a copy of the child for each placement to avoid reference issues
                const childCopy: ContentItemWithChildren = {
                  ...child,
                  children: [...(child.children || [])],
                  versions: child.versions,
                }
                parent.children!.push(childCopy)
              }
            })
          }
        }
      })

      return rootItems
    },
    enabled: Boolean(universeId),
  })
}

export function useCreateContentItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: {
      title: string
      description?: string
      item_type: ContentItem['item_type']
      universe_id: string
      parent_id?: string
      selectedItemsToWrap?: ContentItemWithChildren[]
    }) => {
      // Get next order_index for siblings using placements
      const { data: siblingPlacements } = await supabase
        .from('content_placements')
        .select('order_index')
        .eq('parent_id', item.parent_id || null)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrderIndex = siblingPlacements?.[0]?.order_index !== undefined ? siblingPlacements[0].order_index + 1 : 0

      // Generate unique slug
      const baseSlug = generateSlug(item.title)
      const slug = await ensureUniqueSlug(baseSlug, item.universe_id)

      const contentItemId = uuidv4()

      const { data, error } = await supabase
        .from('content_items')
        .insert({
          id: contentItemId,
          title: item.title,
          slug,
          description: item.description,
          item_type: item.item_type,
          universe_id: item.universe_id,
          parent_id: item.parent_id,
          order_index: nextOrderIndex,
        })
        .select()
        .single()

      if (error) throw error

      // Create placement record for the new content item
      const { error: placementError } = await supabase
        .from('content_placements')
        .insert({
          content_item_id: contentItemId,
          parent_id: item.parent_id || null,
          order_index: nextOrderIndex,
        })

      if (placementError) throw placementError

      // Create default version for the new content item
      const { error: versionError } = await supabase
        .from('content_versions')
        .insert({
          content_item_id: contentItemId,
          version_name: 'Original',
          is_primary: true,
        })

      if (versionError) {
        console.error('Failed to create default version:', versionError)
        // Don't throw error - content item creation should still succeed
      }

      // If wrapping selected items, create new placements under the new parent
      if (item.selectedItemsToWrap && item.selectedItemsToWrap.length > 0) {
        // First, remove existing placements for these items at the current level
        const itemsToWrapIds = item.selectedItemsToWrap.map(item => item.id)
        
        await supabase
          .from('content_placements')
          .delete()
          .in('content_item_id', itemsToWrapIds)
          .eq('parent_id', item.parent_id || null)

        // Create new placements under the new parent
        const newPlacements = item.selectedItemsToWrap.map((itemToWrap, index) => ({
          content_item_id: itemToWrap.id,
          parent_id: contentItemId,
          order_index: index
        }))

        const { error: wrapError } = await supabase
          .from('content_placements')
          .insert(newPlacements)

        if (wrapError) throw wrapError
      }

      return data as ContentItem
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-items', variables.universe_id] })
      // Update current version snapshot
      await updateCurrentVersionSnapshot(variables.universe_id)
    },
  })
}

export function useUpdateContentItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: Partial<ContentItem> & { id: string }) => {
      const updates = { ...item }
      
      // If title is being updated, regenerate slug
      if (updates.title) {
        const baseSlug = generateSlug(updates.title)
        updates.slug = await ensureUniqueSlug(baseSlug, updates.universe_id!, updates.id)
      }
      
      const { data, error } = await supabase
        .from('content_items')
        .update(updates)
        .eq('id', item.id)
        .select()
        .single()

      if (error) throw error
      return data as ContentItem
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['content-items', data.universe_id] })
      // Update current version snapshot
      await updateCurrentVersionSnapshot(data.universe_id)
    },
  })
}

export function useDeleteContentItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, universeId }: { itemId: string; universeId: string }) => {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      return universeId
    },
    onSuccess: async (universeId) => {
      queryClient.invalidateQueries({ queryKey: ['content-items', universeId] })
      // Update current version snapshot
      await updateCurrentVersionSnapshot(universeId)
    },
  })
}

export function useReorderContentItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      universeId,
      updates
    }: {
      universeId: string
      updates: Array<{ id: string; order_index: number; parent_id: string | null }>
    }) => {
      // Update all items in a batch
      const promises = updates.map(update => 
        supabase
          .from('content_items')
          .update({ 
            order_index: update.order_index,
            parent_id: update.parent_id 
          })
          .eq('id', update.id)
      )

      const results = await Promise.all(promises)
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }

      return universeId
    },
    onSuccess: async (universeId) => {
      queryClient.invalidateQueries({ queryKey: ['content-items', universeId] })
      // Update current version snapshot
      await updateCurrentVersionSnapshot(universeId)
    },
  })
}

export function useContentItemBySlug(universeId: string, slug: string) {
  return useQuery({
    queryKey: ['content-item', universeId, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          versions:content_versions(*)
        `)
        .eq('universe_id', universeId)
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data as ContentItem & { versions?: any[] }
    },
    enabled: Boolean(universeId && slug),
  })
}