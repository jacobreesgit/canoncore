'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CustomContentType } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'
import { useDisabledContentTypes } from './use-disabled-content-types'

// Fetch all custom content types for a specific universe
export function useCustomContentTypes(universeId: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['custom-content-types', universeId],
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('custom_content_types')
        .select('*')
        .eq('universe_id', universeId)
        .order('name')
      
      if (error) throw error
      return data as CustomContentType[]
    },
    enabled: !!user && !!universeId,
  })
}

// Create a new custom content type
export function useCreateCustomContentType() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ name, emoji, universeId }: { name: string; emoji?: string; universeId: string }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('custom_content_types')
        .insert({
          name,
          emoji: emoji || '📄',
          user_id: user.id,
          universe_id: universeId,
        })
        .select()
        .single()
      
      if (error) throw error
      return data as CustomContentType
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-content-types', variables.universeId] })
    },
  })
}

// Update a custom content type
export function useUpdateCustomContentType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, name, emoji }: { id: string; name?: string; emoji?: string }) => {
      const updateData: { name?: string; emoji?: string } = {}
      if (name !== undefined) updateData.name = name
      if (emoji !== undefined) updateData.emoji = emoji
      
      const { data, error } = await supabase
        .from('custom_content_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as CustomContentType
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-content-types', data.universe_id] })
    },
  })
}

// Delete a custom content type
export function useDeleteCustomContentType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, universeId }: { id: string; universeId: string }) => {
      const { error } = await supabase
        .from('custom_content_types')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return universeId
    },
    onSuccess: (universeId) => {
      queryClient.invalidateQueries({ queryKey: ['custom-content-types', universeId] })
    },
  })
}

// Built-in content types for reference
export const BUILT_IN_CONTENT_TYPES = [
  { id: 'film', name: 'Film', emoji: '🎬' },
  { id: 'book', name: 'Book', emoji: '📚' },
  { id: 'episode', name: 'Episode', emoji: '📺' },
  { id: 'series', name: 'Series', emoji: '📺' },
  { id: 'season', name: 'Season', emoji: '📺' },
  { id: 'collection', name: 'Collection', emoji: '📁' },
  { id: 'character', name: 'Character', emoji: '👤' },
  { id: 'location', name: 'Location', emoji: '📍' },
  { id: 'event', name: 'Event', emoji: '⚡' },
  { id: 'documentary', name: 'Documentary', emoji: '🎥' },
  { id: 'short', name: 'Short', emoji: '🎬' },
  { id: 'special', name: 'Special', emoji: '✨' },
] as const

// Get all available content types (built-in + custom) for a specific universe
export function useAllContentTypes(universeId: string) {
  const customTypesQuery = useCustomContentTypes(universeId)
  const disabledTypesQuery = useDisabledContentTypes(universeId)
  
  // Filter out disabled built-in types
  const enabledBuiltInTypes = BUILT_IN_CONTENT_TYPES.filter(type => 
    !disabledTypesQuery.data?.some(dt => dt.content_type === type.id)
  )
  
  const allTypes = [
    ...enabledBuiltInTypes,
    ...(customTypesQuery.data?.map(type => ({
      id: type.name.toLowerCase().replace(/\s+/g, '_'),
      name: type.name,
      emoji: type.emoji,
      isCustom: true,
      customId: type.id,
    })) || [])
  ]
  
  return {
    data: allTypes,
    isLoading: customTypesQuery.isLoading || disabledTypesQuery.isLoading,
    error: customTypesQuery.error || disabledTypesQuery.error,
  }
}