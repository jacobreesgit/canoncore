import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { UniverseVersion, VersionSnapshot, ContentItem, CustomContentType, DisabledContentType } from '@/types/database'

// Utility function to update current version snapshot with current universe state
export async function updateCurrentVersionSnapshot(universeId: string) {
  try {
    // Get current version
    const { data: currentVersion, error: versionError } = await supabase
      .from('universe_versions')
      .select('id')
      .eq('universe_id', universeId)
      .eq('is_current', true)
      .single()

    if (versionError || !currentVersion) {
      console.error('Error finding current version:', versionError)
      return
    }

    // Get current universe state
    const [contentItems, customTypes, disabledTypes] = await Promise.all([
      supabase
        .from('content_items')
        .select('*')
        .eq('universe_id', universeId)
        .order('order_index'),
      supabase
        .from('custom_content_types')
        .select('*')
        .eq('universe_id', universeId),
      supabase
        .from('disabled_content_types')
        .select('*')
        .eq('universe_id', universeId),
    ])

    if (contentItems.error || customTypes.error || disabledTypes.error) {
      console.error('Error fetching universe state for snapshot update')
      return
    }

    // Update the current version's snapshot
    const { error: updateError } = await supabase
      .from('version_snapshots')
      .update({
        content_items_snapshot: contentItems.data || [],
        custom_types_snapshot: customTypes.data || [],
        disabled_types_snapshot: disabledTypes.data || [],
      })
      .eq('version_id', currentVersion.id)

    if (updateError) {
      console.error('Error updating current version snapshot:', updateError)
    }
  } catch (error) {
    console.error('Error in updateCurrentVersionSnapshot:', error)
  }
}

// Fetch all versions for a universe
export function useUniverseVersions(universeId: string) {
  return useQuery({
    queryKey: ['universe-versions', universeId],
    queryFn: async (): Promise<UniverseVersion[]> => {
      const { data, error } = await supabase
        .from('universe_versions')
        .select('*')
        .eq('universe_id', universeId)
        .order('version_number', { ascending: false })

      if (error) {
        console.error('Error loading universe versions:', error)
        throw error
      }

      return data || []
    },
    enabled: !!universeId,
  })
}

// Get the current active version for a universe
export function useCurrentUniverseVersion(universeId: string) {
  return useQuery({
    queryKey: ['current-universe-version', universeId],
    queryFn: async (): Promise<UniverseVersion | null> => {
      const { data, error } = await supabase
        .from('universe_versions')
        .select('*')
        .eq('universe_id', universeId)
        .eq('is_current', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No current version found
          return null
        }
        console.error('Error loading current universe version:', error)
        throw error
      }

      return data
    },
    enabled: !!universeId,
  })
}

// Get version snapshot data
export function useVersionSnapshot(versionId: string) {
  return useQuery({
    queryKey: ['version-snapshot', versionId],
    queryFn: async (): Promise<VersionSnapshot | null> => {
      const { data, error } = await supabase
        .from('version_snapshots')
        .select('*')
        .eq('version_id', versionId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error loading version snapshot:', error)
        throw error
      }

      return data
    },
    enabled: !!versionId,
  })
}

// Get the next version number for a universe
export function useNextVersionNumber(universeId: string) {
  return useQuery({
    queryKey: ['next-version-number', universeId],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .rpc('get_next_version_number', { universe_uuid: universeId })

      if (error) {
        console.error('Error getting next version number:', error)
        throw error
      }

      return data || 1
    },
    enabled: !!universeId,
  })
}

// Create a new universe version (commit)
export function useCreateUniverseVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      universeId,
      commitMessage,
      setCurrent = true,
    }: {
      universeId: string
      commitMessage?: string
      setCurrent?: boolean
    }): Promise<UniverseVersion> => {
      // Get the next version number
      const { data: nextVersionNumberData, error: versionNumberError } = await supabase
        .rpc('get_next_version_number', { universe_uuid: universeId })

      if (versionNumberError) {
        console.error('Error getting next version number:', versionNumberError)
        throw versionNumberError
      }

      const nextVersionNumber = nextVersionNumberData || 1
      const versionName = `v${nextVersionNumber}`

      // First, capture the current universe state
      const [contentItems, customTypes, disabledTypes] = await Promise.all([
        // Get all content items for this universe
        supabase
          .from('content_items')
          .select('*')
          .eq('universe_id', universeId)
          .order('order_index'),
        // Get all custom content types
        supabase
          .from('custom_content_types')
          .select('*')
          .eq('universe_id', universeId),
        // Get all disabled content types
        supabase
          .from('disabled_content_types')
          .select('*')
          .eq('universe_id', universeId),
      ])

      if (contentItems.error) {
        console.error('Error fetching content items for version:', contentItems.error)
        throw contentItems.error
      }
      if (customTypes.error) {
        console.error('Error fetching custom types for version:', customTypes.error)
        throw customTypes.error
      }
      if (disabledTypes.error) {
        console.error('Error fetching disabled types for version:', disabledTypes.error)
        throw disabledTypes.error
      }

      // Create the version record
      const { data: version, error: versionError } = await supabase
        .from('universe_versions')
        .insert({
          universe_id: universeId,
          version_name: versionName,
          version_number: nextVersionNumber,
          commit_message: commitMessage,
          is_current: setCurrent,
        })
        .select()
        .single()

      if (versionError) {
        console.error('Error creating universe version:', versionError)
        throw versionError
      }

      // Create the snapshot
      const { error: snapshotError } = await supabase
        .from('version_snapshots')
        .insert({
          version_id: version.id,
          content_items_snapshot: contentItems.data || [],
          custom_types_snapshot: customTypes.data || [],
          disabled_types_snapshot: disabledTypes.data || [],
        })

      if (snapshotError) {
        console.error('Error creating version snapshot:', snapshotError)
        throw snapshotError
      }

      return version
    },
    onSuccess: (version) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['universe-versions', version.universe_id] })
      queryClient.invalidateQueries({ queryKey: ['current-universe-version', version.universe_id] })
      queryClient.invalidateQueries({ queryKey: ['next-version-number', version.universe_id] })
    },
  })
}

// Switch to a different version (checkout)
export function useSwitchUniverseVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      universeId,
      versionId,
    }: {
      universeId: string
      versionId: string
    }): Promise<void> => {
      // Get the snapshot data for the target version
      const { data: snapshot, error: snapshotError } = await supabase
        .from('version_snapshots')
        .select('*')
        .eq('version_id', versionId)
        .single()

      if (snapshotError) {
        console.error('Error loading version snapshot for switch:', snapshotError)
        throw snapshotError
      }

      // Clear current universe state
      await Promise.all([
        supabase.from('content_items').delete().eq('universe_id', universeId),
        supabase.from('custom_content_types').delete().eq('universe_id', universeId),
        supabase.from('disabled_content_types').delete().eq('universe_id', universeId),
      ])

      // Restore from snapshot
      const contentItems = snapshot.content_items_snapshot as ContentItem[]
      const customTypes = snapshot.custom_types_snapshot as CustomContentType[]
      const disabledTypes = snapshot.disabled_types_snapshot as DisabledContentType[]

      if (contentItems.length > 0) {
        const { error: contentError } = await supabase
          .from('content_items')
          .insert(contentItems)

        if (contentError) {
          console.error('Error restoring content items:', contentError)
          throw contentError
        }
      }

      if (customTypes.length > 0) {
        const { error: customError } = await supabase
          .from('custom_content_types')
          .insert(customTypes)

        if (customError) {
          console.error('Error restoring custom types:', customError)
          throw customError
        }
      }

      if (disabledTypes.length > 0) {
        const { error: disabledError } = await supabase
          .from('disabled_content_types')
          .insert(disabledTypes)

        if (disabledError) {
          console.error('Error restoring disabled types:', disabledError)
          throw disabledError
        }
      }

      // Update the is_current flag for the target version
      const { error } = await supabase
        .from('universe_versions')
        .update({ is_current: true })
        .eq('id', versionId)

      if (error) {
        console.error('Error switching universe version:', error)
        throw error
      }
    },
    onSuccess: (_, { universeId }) => {
      // Invalidate relevant queries to refresh all data
      queryClient.invalidateQueries({ queryKey: ['universe-versions', universeId] })
      queryClient.invalidateQueries({ queryKey: ['current-universe-version', universeId] })
      queryClient.invalidateQueries({ queryKey: ['content-items', universeId] })
      queryClient.invalidateQueries({ queryKey: ['custom-content-types', universeId] })
      queryClient.invalidateQueries({ queryKey: ['disabled-content-types', universeId] })
    },
  })
}

// Delete a universe version
export function useDeleteUniverseVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      versionId,
      universeId,
    }: {
      versionId: string
      universeId: string
    }): Promise<void> => {
      // Check if this is the current version
      const { data: versionToDelete } = await supabase
        .from('universe_versions')
        .select('is_current')
        .eq('id', versionId)
        .single()

      // Delete the version
      const { error } = await supabase
        .from('universe_versions')
        .delete()
        .eq('id', versionId)

      if (error) {
        console.error('Error deleting universe version:', error)
        throw error
      }

      // If we deleted the current version, check if only one version remains
      if (versionToDelete?.is_current) {
        const { data: remainingVersions, error: countError } = await supabase
          .from('universe_versions')
          .select('id')
          .eq('universe_id', universeId)

        if (countError) {
          console.error('Error checking remaining versions:', countError)
          return
        }

        // If only one version remains, make it current
        if (remainingVersions && remainingVersions.length === 1) {
          const { error: updateError } = await supabase
            .from('universe_versions')
            .update({ is_current: true })
            .eq('id', remainingVersions[0].id)

          if (updateError) {
            console.error('Error setting last version as current:', updateError)
          }
        }
      }
    },
    onSuccess: (_, { universeId }) => {
      queryClient.invalidateQueries({ queryKey: ['universe-versions', universeId] })
      queryClient.invalidateQueries({ queryKey: ['current-universe-version', universeId] })
      queryClient.invalidateQueries({ queryKey: ['next-version-number', universeId] })
    },
  })
}

// Restore universe to a specific version state
export function useRestoreUniverseVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      universeId,
      versionId,
      createNewVersion = true,
    }: {
      universeId: string
      versionId: string
      createNewVersion?: boolean
    }): Promise<void> => {
      // Get the snapshot data
      const { data: snapshot, error: snapshotError } = await supabase
        .from('version_snapshots')
        .select('*')
        .eq('version_id', versionId)
        .single()

      if (snapshotError) {
        console.error('Error loading version snapshot for restore:', snapshotError)
        throw snapshotError
      }

      // Clear current universe state
      await Promise.all([
        supabase.from('content_items').delete().eq('universe_id', universeId),
        supabase.from('custom_content_types').delete().eq('universe_id', universeId),
        supabase.from('disabled_content_types').delete().eq('universe_id', universeId),
      ])

      // Restore from snapshot
      const contentItems = snapshot.content_items_snapshot as ContentItem[]
      const customTypes = snapshot.custom_types_snapshot as CustomContentType[]
      const disabledTypes = snapshot.disabled_types_snapshot as DisabledContentType[]

      if (contentItems.length > 0) {
        const { error: contentError } = await supabase
          .from('content_items')
          .insert(contentItems)

        if (contentError) {
          console.error('Error restoring content items:', contentError)
          throw contentError
        }
      }

      if (customTypes.length > 0) {
        const { error: customError } = await supabase
          .from('custom_content_types')
          .insert(customTypes)

        if (customError) {
          console.error('Error restoring custom types:', customError)
          throw customError
        }
      }

      if (disabledTypes.length > 0) {
        const { error: disabledError } = await supabase
          .from('disabled_content_types')
          .insert(disabledTypes)

        if (disabledError) {
          console.error('Error restoring disabled types:', disabledError)
          throw disabledError
        }
      }

      // Optionally create a new version for this restore
      if (createNewVersion) {
        const [version, nextVersionNumber] = await Promise.all([
          supabase
            .from('universe_versions')
            .select('version_name')
            .eq('id', versionId)
            .single(),
          supabase.rpc('get_next_version_number', { universe_uuid: universeId })
        ])

        const nextNumber = nextVersionNumber.data || 1
        const newVersionName = `v${nextNumber}`

        const { data: newVersion, error: newVersionError } = await supabase
          .from('universe_versions')
          .insert({
            universe_id: universeId,
            version_name: newVersionName,
            version_number: nextNumber,
            commit_message: `Restored universe to version: ${version?.data?.version_name || 'Unknown'}`,
            is_current: true,
          })
          .select()
          .single()

        if (newVersionError) {
          console.error('Error creating restore version:', newVersionError)
          throw newVersionError
        }

        // Create snapshot for the new restore version
        const { error: snapshotError } = await supabase
          .from('version_snapshots')
          .insert({
            version_id: newVersion.id,
            content_items_snapshot: contentItems,
            custom_types_snapshot: customTypes,
            disabled_types_snapshot: disabledTypes,
          })

        if (snapshotError) {
          console.error('Error creating restore version snapshot:', snapshotError)
        }
      }
    },
    onSuccess: (_, { universeId }) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['content-items', universeId] })
      queryClient.invalidateQueries({ queryKey: ['custom-content-types', universeId] })
      queryClient.invalidateQueries({ queryKey: ['disabled-content-types', universeId] })
      queryClient.invalidateQueries({ queryKey: ['universe-versions', universeId] })
      queryClient.invalidateQueries({ queryKey: ['current-universe-version', universeId] })
      queryClient.invalidateQueries({ queryKey: ['next-version-number', universeId] })
    },
  })
}