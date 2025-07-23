import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ContentItem, ContentItemWithChildren } from '@/types/database'
import { updateCurrentVersionSnapshot } from './use-universe-versions'
import { v4 as uuidv4 } from 'uuid'

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
      const { data: siblings } = await supabase
        .from('content_items')
        .select('order_index')
        .eq('universe_id', item.universe_id)
        .eq('parent_id', item.parent_id || null)
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrderIndex = siblings?.[0]?.order_index ? siblings[0].order_index + 1 : 0

      const { data, error } = await supabase
        .from('content_items')
        .insert({
          id: uuidv4(),
          title: item.title,
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
      const { data, error } = await supabase
        .from('content_items')
        .update(item)
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