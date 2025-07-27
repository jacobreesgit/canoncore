'use client'

import { Universe } from '@/types/database'
import { useEntities, useEntity, useCreateEntity, useUpdateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Utility function for generating slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Universe-specific entity configuration
const universeConfig: EntityConfig<Universe> = {
  tableName: 'universes',
  queryKey: 'universes',
  defaultOrder: { column: 'created_at', ascending: false },
  
  beforeCreate: async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const processedData = { ...data }
    
    // Generate slug from name
    if (data.name) {
      processedData.slug = generateSlug(data.name)
    }
    
    // Add user_id and explicit id for version creation
    processedData.user_id = user.id
    processedData.id = uuidv4()
    
    return processedData
  },

  afterCreate: async (universe) => {
    // Create the initial version after universe creation
    const { error: versionError } = await supabase
      .from('universe_versions')
      .insert({
        universe_id: universe.id,
        version_name: 'v1',
        version_number: 1,
        commit_message: 'Universe created',
        is_current: true,
      })

    if (versionError) {
      console.error('Failed to create initial version:', versionError)
      // Don't throw here as universe was created successfully
    }
  },

  beforeUpdate: async (data) => {
    const processedData = { ...data }
    
    // Regenerate slug if name is being updated
    if (data.name) {
      processedData.slug = generateSlug(data.name)
    }
    
    return processedData
  },

  afterUpdate: async (universe) => {
    // Update current version snapshot when universe is updated
    try {
      const { updateCurrentVersionSnapshot } = await import('./use-universe-versions')
      await updateCurrentVersionSnapshot(universe.id)
    } catch (error) {
      console.error('Failed to update version snapshot:', error)
      // Don't throw as universe update was successful
    }
  },

  afterDelete: async (universeId) => {
    // Database CASCADE constraints handle cleanup automatically
    // No additional cleanup needed
  },
}

// Universe hooks using the generic pattern
export function useUniverses() {
  return useEntities(universeConfig, undefined, {
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('universes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as unknown) as Universe[]
    },
  })
}

export function useUniverse(username: string | null, slug: string | null) {
  const queryKey = username && slug ? `${username}/${slug}` : null
  
  return useEntity(universeConfig, queryKey, {
    queryFn: async () => {
      if (!username || !slug) throw new Error('Username and slug are required')
      
      const { data, error } = await supabase
        .from('universes')
        .select('*')
        .eq('username', username)
        .eq('slug', slug)
        .single()

      if (error) throw error
      return (data as unknown) as Universe
    },
  })
}

export function useCreateUniverse() {
  return useCreateEntity(universeConfig)
}

export function useUpdateUniverse() {
  return useUpdateEntity(universeConfig)
}

export function useDeleteUniverse() {
  return useDeleteEntity(universeConfig)
}

export function usePublicUniverses() {
  return useEntities(universeConfig, {
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universes')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as unknown) as (Universe & { profiles: { full_name: string } | null })[]
    },
  })
}

// Export the config for use in components
export { universeConfig }