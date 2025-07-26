'use client'

import { CustomOrganisationType } from '@/types/database'
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { useDisabledOrganisationTypes } from './use-disabled-organisation-types'

// Custom organisation type entity configuration
const customOrganisationTypeConfig: EntityConfig<CustomOrganisationType> = {
  tableName: 'custom_organisation_types',
  queryKey: 'custom-organisation-types',
  defaultOrder: { column: 'name', ascending: true },
  
  beforeCreate: async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const processedData = { ...data }
    
    // Add user_id
    processedData.user_id = user.id
    
    return processedData
  },
}

// Fetch all custom organisation types for a specific universe
export function useCustomOrganisationTypes(universeId: string) {
  const { user } = useAuth()
  
  return useEntities(customOrganisationTypeConfig, { universe_id: universeId }, {
    enabled: !!user && !!universeId,
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('custom_organisation_types')
        .select('*')
        .eq('universe_id', universeId)
        .order('name')
      
      if (error) throw error
      return (data as unknown) as CustomOrganisationType[]
    },
  })
}

// Create a new custom organisation type
export function useCreateCustomOrganisationType() {
  return useCreateEntity(customOrganisationTypeConfig, {
    onSuccess: (data) => {
      // Additional invalidation for universe-specific queries
      const queryClient = customOrganisationTypeConfig.queryKey
      // This will be handled by the generic pattern's onSuccess
    },
  })
}

// Update an existing custom organisation type
export function useUpdateCustomOrganisationType() {
  return useUpdateEntity(customOrganisationTypeConfig)
}

// Delete a custom organisation type
export function useDeleteCustomOrganisationType() {
  return useDeleteEntity(customOrganisationTypeConfig)
}

// Built-in organisation types for reference
export const BUILT_IN_ORGANISATION_TYPES = [
  { id: 'collection', name: 'Collection' },
  { id: 'serial', name: 'Serial' },
  { id: 'story', name: 'Story' },
] as const

// Get all available organisation types (built-in + custom) for a specific universe
export function useAllOrganisationTypes(universeId: string) {
  const customTypesQuery = useCustomOrganisationTypes(universeId)
  const disabledTypesQuery = useDisabledOrganisationTypes(universeId)
  
  // Filter out disabled built-in types
  const enabledBuiltInTypes = BUILT_IN_ORGANISATION_TYPES.filter(type => 
    !disabledTypesQuery.data?.some(dt => dt.type_name === type.id)
  )
  
  const allTypes = [
    ...enabledBuiltInTypes,
    ...(customTypesQuery.data?.map(type => ({
      id: type.name.toLowerCase().replace(/\s+/g, '_'),
      name: type.name,
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
export { customOrganisationTypeConfig }