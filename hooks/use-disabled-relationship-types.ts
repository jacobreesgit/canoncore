'use client'

import { DisabledRelationshipType } from '@/types/database'
import { useEntities, useCreateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

// Disabled relationship type entity configuration
const disabledRelationshipTypeConfig: EntityConfig<DisabledRelationshipType> = {
  tableName: 'disabled_relationship_types',
  queryKey: 'disabled-relationship-types',
  defaultOrder: { column: 'type_name', ascending: true },
}

// Fetch all disabled relationship types for a specific universe
export function useDisabledRelationshipTypes(universeId: string) {
  const { user } = useAuth()
  
  return useEntities(disabledRelationshipTypeConfig, { universe_id: universeId }, {
    enabled: !!user && !!universeId,
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('disabled_relationship_types')
        .select('*')
        .eq('universe_id', universeId)
        .order('type_name')
      
      if (error) throw error
      return (data as unknown) as DisabledRelationshipType[]
    },
  })
}

// Disable a built-in relationship type for a universe
export function useDisableRelationshipType() {
  return useCreateEntity(disabledRelationshipTypeConfig)
}

// Re-enable a built-in relationship type for a universe (delete the disabled record)
export function useEnableRelationshipType() {
  return useDeleteEntity(disabledRelationshipTypeConfig)
}

// Export the config for use in components
export { disabledRelationshipTypeConfig }