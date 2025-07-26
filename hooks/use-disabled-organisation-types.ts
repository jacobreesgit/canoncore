'use client'

import { DisabledOrganisationType } from '@/types/database'
import { useEntities, useCreateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Disabled organisation type entity configuration
const disabledOrganisationTypeConfig: EntityConfig<DisabledOrganisationType> = {
  tableName: 'disabled_organisation_types',
  queryKey: 'disabled-organisation-types',
  defaultOrder: { column: 'type_name', ascending: true },
}

// Fetch all disabled organisation types for a specific universe
export function useDisabledOrganisationTypes(universeId: string) {
  const { user } = useAuth()
  
  return useEntities(disabledOrganisationTypeConfig, { universe_id: universeId }, {
    enabled: !!user && !!universeId,
    queryFn: async () => {
      if (!user || !universeId) return []
      
      const { data, error } = await supabase
        .from('disabled_organisation_types')
        .select('*')
        .eq('universe_id', universeId)
      
      if (error) throw error
      return (data as unknown) as DisabledOrganisationType[]
    },
  })
}

// Disable a built-in organisation type for a universe (create a disabled record)
export function useDisableOrganisationType() {
  return useCreateEntity(disabledOrganisationTypeConfig)
}

// Enable a built-in organisation type for a universe (delete from disabled list)
// This requires custom logic as it's not a simple ID-based delete
export function useEnableOrganisationType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ universeId, typeName }: { universeId: string; typeName: string }) => {
      const { error } = await supabase
        .from('disabled_organisation_types')
        .delete()
        .eq('universe_id', universeId)
        .eq('type_name', typeName)
      
      if (error) throw error
      return { universeId, typeName }
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['disabled-organisation-types', variables.universeId] })
      queryClient.invalidateQueries({ queryKey: ['disabled-organisation-types'] })
    },
  })
}

