'use client'

import { CustomRelationshipType } from '@/types/database'
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { useDisabledRelationshipTypes } from './use-disabled-relationship-types'

// Custom relationship type entity configuration
const customRelationshipTypeConfig: EntityConfig<CustomRelationshipType> = {
  tableName: 'custom_relationship_types',
  queryKey: 'custom-relationship-types',
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

// Fetch all custom relationship types for a specific universe
export function useCustomRelationshipTypes(universeId: string) {
  const { user } = useAuth()
  
  return useEntities(customRelationshipTypeConfig, { universe_id: universeId }, {
    enabled: !!user && !!universeId,
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('custom_relationship_types')
        .select('*')
        .eq('universe_id', universeId)
        .order('name')
      
      if (error) throw error
      return (data as unknown) as CustomRelationshipType[]
    },
  })
}

// Create a new custom relationship type
export function useCreateCustomRelationshipType() {
  return useCreateEntity(customRelationshipTypeConfig, {
    onSuccess: (data) => {
      // Additional invalidation for universe-specific queries
      const queryClient = customRelationshipTypeConfig.queryKey
      // This will be handled by the generic pattern's onSuccess
    },
  })
}

// Update an existing custom relationship type
export function useUpdateCustomRelationshipType() {
  return useUpdateEntity(customRelationshipTypeConfig)
}

// Delete a custom relationship type
export function useDeleteCustomRelationshipType() {
  return useDeleteEntity(customRelationshipTypeConfig)
}

// Built-in relationship types for reference
export const BUILT_IN_RELATIONSHIP_TYPES = [
  { id: 'sequel', name: 'Sequel', description: 'This content continues the story of another' },
  { id: 'spinoff', name: 'Spin-off', description: 'This content is derived from another but focuses on different aspects' },
  { id: 'reference', name: 'Reference', description: 'This content references or mentions another work' },
  { id: 'related', name: 'Related', description: 'This content is connected to another in some way' },
] as const

// Get all available relationship types (built-in + custom) for a specific universe
export function useAllRelationshipTypes(universeId: string) {
  const customTypesQuery = useCustomRelationshipTypes(universeId)
  const disabledTypesQuery = useDisabledRelationshipTypes(universeId)
  
  // Filter out disabled built-in types
  const enabledBuiltInTypes = BUILT_IN_RELATIONSHIP_TYPES.filter(type => 
    !disabledTypesQuery.data?.some(dt => dt.type_name === type.id)
  )
  
  const allTypes = [
    ...enabledBuiltInTypes.map(type => ({
      value: type.id,
      label: type.name,
      description: type.description,
      isBuiltIn: true,
    })),
    ...(customTypesQuery.data?.map(type => ({
      value: type.id,  // Use the UUID as the value to match database link_type
      label: type.name,
      description: type.description,
      isBuiltIn: false,
      customId: type.id,
    })) || [])
  ].sort((a, b) => a.label.localeCompare(b.label))
  
  return {
    data: allTypes,
    isLoading: customTypesQuery.isLoading || disabledTypesQuery.isLoading,
    error: customTypesQuery.error || disabledTypesQuery.error,
  }
}

// Export the config for use in components
export { customRelationshipTypeConfig }