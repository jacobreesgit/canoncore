'use client'

import { DisabledContentType } from '@/types/database'
import { useEntities, useCreateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Disabled content type entity configuration
const disabledContentTypeConfig: EntityConfig<DisabledContentType> = {
  tableName: 'disabled_content_types',
  queryKey: 'disabled-content-types',
  defaultOrder: { column: 'content_type', ascending: true },
}

// Fetch all disabled content types for a specific universe
export function useDisabledContentTypes(universeId: string) {
  const { user } = useAuth()
  
  return useEntities(disabledContentTypeConfig, { universe_id: universeId }, {
    enabled: !!user && !!universeId,
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('disabled_content_types')
        .select('*')
        .eq('universe_id', universeId)
      
      if (error) throw error
      return (data as unknown) as DisabledContentType[]
    },
  })
}

// Disable a built-in content type for a universe (create a disabled record)
export function useDisableContentType() {
  return useCreateEntity(disabledContentTypeConfig)
}

// Enable a built-in content type for a universe (delete from disabled list)
// This requires custom logic as it's not a simple ID-based delete
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
      queryClient.invalidateQueries({ queryKey: ['disabled-content-types'] })
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