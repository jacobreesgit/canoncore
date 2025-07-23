'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { DisabledContentType } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'

// Fetch all disabled content types for a specific universe
export function useDisabledContentTypes(universeId: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['disabled-content-types', universeId],
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('disabled_content_types')
        .select('*')
        .eq('universe_id', universeId)
      
      if (error) throw error
      return data as DisabledContentType[]
    },
    enabled: !!user && !!universeId,
  })
}

// Disable a built-in content type for a universe
export function useDisableContentType() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ universeId, contentType }: { universeId: string; contentType: string }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('disabled_content_types')
        .insert({
          universe_id: universeId,
          content_type: contentType,
        })
        .select()
        .single()
      
      if (error) throw error
      return data as DisabledContentType
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disabled-content-types', variables.universeId] })
    },
  })
}

// Enable a built-in content type for a universe (remove from disabled list)
export function useEnableContentType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ universeId, contentType }: { universeId: string; contentType: string }) => {
      const { error } = await supabase
        .from('disabled_content_types')
        .delete()
        .eq('universe_id', universeId)
        .eq('content_type', contentType)
      
      if (error) throw error
      return { universeId, contentType }
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['disabled-content-types', variables.universeId] })
    },
  })
}

// Check if a content type is disabled in a universe
export function useIsContentTypeDisabled(universeId: string, contentType: string) {
  const disabledTypesQuery = useDisabledContentTypes(universeId)
  
  return {
    isDisabled: disabledTypesQuery.data?.some(dt => dt.content_type === contentType) || false,
    isLoading: disabledTypesQuery.isLoading,
    error: disabledTypesQuery.error,
  }
}