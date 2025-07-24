'use client'

import { CustomContentType } from '@/types/database'
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { useDisabledContentTypes } from './use-disabled-content-types'

// Custom content type entity configuration
const customContentTypeConfig: EntityConfig<CustomContentType> = {
  tableName: 'custom_content_types',
  queryKey: 'custom-content-types',
  defaultOrder: { column: 'name', ascending: true },
  
  beforeCreate: async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const processedData = { ...data }
    
    // Set default emoji if not provided
    if (!processedData.emoji) {
      processedData.emoji = '📄'
    }
    
    // Add user_id
    processedData.user_id = user.id
    
    return processedData
  },
}

// Fetch all custom content types for a specific universe
export function useCustomContentTypes(universeId: string) {
  const { user } = useAuth()
  
  return useEntities(customContentTypeConfig, { universe_id: universeId }, {
    enabled: !!user && !!universeId,
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('custom_content_types')
        .select('*')
        .eq('universe_id', universeId)
        .order('name')
      
      if (error) throw error
      return (data as unknown) as CustomContentType[]
    },
  })
}

// Create a new custom content type
export function useCreateCustomContentType() {
  return useCreateEntity(customContentTypeConfig, {
    onSuccess: (data) => {
      // Additional invalidation for universe-specific queries
      const queryClient = customContentTypeConfig.queryKey
      // This will be handled by the generic pattern's onSuccess
    },
  })
}

// Update an existing custom content type
export function useUpdateCustomContentType() {
  return useUpdateEntity(customContentTypeConfig)
}

// Delete a custom content type
export function useDeleteCustomContentType() {
  return useDeleteEntity(customContentTypeConfig)
}

// Built-in content types for reference
export const BUILT_IN_CONTENT_TYPES = [
  { id: 'collection', name: 'Collection', emoji: '📦' },
  { id: 'serial', name: 'Serial', emoji: '📽️' },
  { id: 'story', name: 'Story', emoji: '📖' },
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
  ].sort((a, b) => a.name.localeCompare(b.name))
  
  return {
    data: allTypes,
    isLoading: customTypesQuery.isLoading || disabledTypesQuery.isLoading,
    error: customTypesQuery.error || disabledTypesQuery.error,
  }
}

// Export the config for use in components
export { customContentTypeConfig }