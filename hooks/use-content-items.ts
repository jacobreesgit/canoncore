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
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          versions:content_versions(*)
        `)
        .eq('universe_id', universeId)
        .order('order_index', { ascending: true })

      if (error) throw error

      // Build hierarchical structure
      const itemsMap = new Map<string, ContentItemWithChildren>()
      const rootItems: ContentItemWithChildren[] = []

      // First pass: create all items
      data.forEach(item => {
        const itemWithChildren: ContentItemWithChildren = {
          ...item,
          children: [],
          versions: item.versions || [],
        }
        itemsMap.set(item.id, itemWithChildren)
      })

      // Second pass: build hierarchy
      data.forEach(item => {
        const itemWithChildren = itemsMap.get(item.id)!
        if (item.parent_id) {
          const parent = itemsMap.get(item.parent_id)
          if (parent) {
            parent.children!.push(itemWithChildren)
          }
        } else {
          rootItems.push(itemWithChildren)
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
    }) => {
      // Get next order_index for siblings
      let query = supabase
        .from('content_items')
        .select('order_index')
        .eq('universe_id', item.universe_id)
        .order('order_index', { ascending: false })
        .limit(1)
      
      // Handle parent_id filtering correctly for SQL NULL
      if (item.parent_id) {
        query = query.eq('parent_id', item.parent_id)
      } else {
        query = query.is('parent_id', null)
      }

      const { data: siblings } = await query

      const nextOrderIndex = siblings?.[0]?.order_index !== undefined ? siblings[0].order_index + 1 : 0

      // Generate unique slug
      const baseSlug = generateSlug(item.title)
      const slug = await ensureUniqueSlug(baseSlug, item.universe_id)

      const { data, error } = await supabase
        .from('content_items')
        .insert({
          id: uuidv4(),
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