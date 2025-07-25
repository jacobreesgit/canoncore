import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { updateCurrentVersionSnapshot } from './use-universe-versions'
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity, EntityConfig } from './use-entity-crud'

export interface ContentVersion {
  id: string
  content_item_id: string
  version_name: string
  version_type: string | null
  release_date: string | null
  runtime_minutes: number | null
  is_primary: boolean
  notes: string | null
  created_at: string
}

export interface CreateContentVersionData {
  content_item_id: string
  version_name: string
  notes?: string
}

export interface UpdateContentVersionData {
  version_name?: string
  notes?: string | null
}

// Content version entity configuration
const contentVersionConfig: EntityConfig<ContentVersion> = {
  tableName: 'content_versions',
  queryKey: 'content-versions',
  defaultOrder: { column: 'created_at', ascending: false },
  
  beforeCreate: async (data) => {
    const processedData = { ...data }
    
    // Clean up notes field
    if (processedData.notes === '') {
      processedData.notes = null
    }
    
    // New versions should become primary by default
    // First, set all existing versions for this content item to non-primary
    if (processedData.content_item_id) {
      await supabase
        .from('content_versions')
        .update({ is_primary: false })
        .eq('content_item_id', processedData.content_item_id)
    }
    
    // Set this new version as primary
    processedData.is_primary = true
    
    return processedData
  },
  
  afterCreate: async (version) => {
    // Update universe version snapshot
    const { data: contentItem } = await supabase
      .from('content_items')
      .select('universe_id')
      .eq('id', version.content_item_id)
      .single()
    
    if (contentItem) {
      await updateCurrentVersionSnapshot(contentItem.universe_id)
    }
  },
  
  afterUpdate: async (version) => {
    // Update universe version snapshot
    const { data: contentItem } = await supabase
      .from('content_items')
      .select('universe_id')
      .eq('id', version.content_item_id)
      .single()
    
    if (contentItem) {
      await updateCurrentVersionSnapshot(contentItem.universe_id)
    }
  },
}

// Fetch all versions for a content item
export function useContentVersions(contentItemId: string) {
  return useEntities(contentVersionConfig, contentItemId ? { content_item_id: contentItemId } : undefined)
}

// Create a new content version
export function useCreateContentVersion() {
  return useCreateEntity(contentVersionConfig)
}

// Update an existing content version
export function useUpdateContentVersion() {
  return useUpdateEntity(contentVersionConfig)
}

// Delete a content version
export function useDeleteContentVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (versionId: string) => {
      // Get version info before deletion
      const { data: version } = await supabase
        .from('content_versions')
        .select('content_item_id, is_primary')
        .eq('id', versionId)
        .single()

      if (!version) throw new Error('Version not found')

      // Check total version count for this content item
      const { count } = await supabase
        .from('content_versions')
        .select('*', { count: 'exact', head: true })
        .eq('content_item_id', version.content_item_id)

      // Prevent deletion if this is the last version
      if (count === 1) {
        throw new Error('Cannot delete the last remaining version. Each content item must have at least one version.')
      }

      // Check if this is the primary version
      if (version.is_primary) {
        // Check if there are other versions  
        const { data: otherVersions } = await supabase
          .from('content_versions')
          .select('id')
          .eq('content_item_id', version.content_item_id)
          .neq('id', versionId)

        if (otherVersions && otherVersions.length > 0) {
          // Set the first other version as primary
          await supabase
            .from('content_versions')
            .update({ is_primary: true })
            .eq('id', otherVersions[0].id)
        }
      }

      // Delete the version
      const { error } = await supabase
        .from('content_versions')
        .delete()
        .eq('id', versionId)

      if (error) throw error
      return version
    },
    onSuccess: async (deletedVersion) => {
      // Invalidate versions query
      queryClient.invalidateQueries({ 
        queryKey: ['content-versions', deletedVersion.content_item_id] 
      })
      
      // Update universe version snapshot
      const { data: contentItem } = await supabase
        .from('content_items')
        .select('universe_id')
        .eq('id', deletedVersion.content_item_id)
        .single()
      
      if (contentItem) {
        await updateCurrentVersionSnapshot(contentItem.universe_id)
      }
    },
  })
}

// Set a version as primary
export function useSetPrimaryVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (versionId: string) => {
      // Get the version to make primary
      const { data: version, error: versionError } = await supabase
        .from('content_versions')
        .select('content_item_id')
        .eq('id', versionId)
        .single()

      if (versionError) throw versionError
      if (!version) throw new Error('Version not found')

      // First, set all versions for this content item to non-primary
      const { error: unsetError } = await supabase
        .from('content_versions')
        .update({ is_primary: false })
        .eq('content_item_id', version.content_item_id)

      if (unsetError) throw unsetError

      // Then set the selected version as primary
      const { data: result, error: setPrimaryError } = await supabase
        .from('content_versions')
        .update({ is_primary: true })
        .eq('id', versionId)
        .select()
        .single()

      if (setPrimaryError) throw setPrimaryError
      return result as ContentVersion
    },
    onSuccess: async (primaryVersion) => {
      // Invalidate versions query
      queryClient.invalidateQueries({ 
        queryKey: ['content-versions', primaryVersion.content_item_id] 
      })
      
      // Update universe version snapshot
      const { data: contentItem } = await supabase
        .from('content_items')
        .select('universe_id')
        .eq('id', primaryVersion.content_item_id)
        .single()
      
      if (contentItem) {
        await updateCurrentVersionSnapshot(contentItem.universe_id)
      }
    },
  })
}


// Get version count for a content item
export function useContentVersionCount(contentItemId: string) {
  return useQuery({
    queryKey: ['content-version-count', contentItemId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('content_versions')
        .select('*', { count: 'exact', head: true })
        .eq('content_item_id', contentItemId)

      if (error) throw error
      return count || 0
    },
    enabled: !!contentItemId,
  })
}

// Export the config for use in components
export { contentVersionConfig }