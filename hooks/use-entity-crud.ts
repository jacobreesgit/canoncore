'use client'

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Base entity interface - all entities should have these properties
interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
}

// Generic configuration for entity operations
export interface EntityConfig<T extends BaseEntity> {
  tableName: string
  queryKey: string
  // Optional transformations
  beforeCreate?: (data: Partial<T>) => Promise<Partial<T>> | Partial<T>
  beforeUpdate?: (data: Partial<T> & { id: string }) => Promise<Partial<T>> | Partial<T>
  afterCreate?: (data: T) => Promise<void> | void
  afterUpdate?: (data: T) => Promise<void> | void
  afterDelete?: (id: string) => Promise<void> | void
  // Query customization
  defaultSelect?: string
  defaultOrder?: { column: string; ascending?: boolean }
}

// Generic hook for fetching all entities
export function useEntities<T extends BaseEntity>(
  config: EntityConfig<T>,
  filters?: Record<string, any>,
  options?: Partial<UseQueryOptions<T[]>>
) {
  return useQuery({
    queryKey: [config.queryKey, filters],
    queryFn: async () => {
      let query = supabase.from(config.tableName).select(config.defaultSelect || '*')
      
      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }
      
      // Apply default ordering
      if (config.defaultOrder) {
        query = query.order(config.defaultOrder.column, { 
          ascending: config.defaultOrder.ascending ?? true 
        })
      }

      const { data, error } = await query
      if (error) throw error
      return (data as unknown) as T[]
    },
    ...options,
  })
}

// Generic hook for fetching a single entity
export function useEntity<T extends BaseEntity>(
  config: EntityConfig<T>,
  id: string | null,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey: [config.queryKey, id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required')
      
      const { data, error } = await supabase
        .from(config.tableName)
        .select(config.defaultSelect || '*')
        .eq('id', id)
        .single()

      if (error) throw error
      return (data as unknown) as T
    },
    enabled: Boolean(id),
    ...options,
  })
}

// Generic hook for creating entities
export function useCreateEntity<T extends BaseEntity>(
  config: EntityConfig<T>,
  options?: UseMutationOptions<T, Error, Partial<T>>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entityData: Partial<T>) => {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Apply pre-creation transformations
      let processedData = entityData
      if (config.beforeCreate) {
        processedData = await config.beforeCreate(entityData)
      }

      const { data, error } = await supabase
        .from(config.tableName)
        .insert(processedData)
        .select()
        .single()

      if (error) throw error
      
      const result = (data as unknown) as T
      
      // Apply post-creation actions
      if (config.afterCreate) {
        await config.afterCreate(result)
      }
      
      return result
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    ...options,
  })
}

// Generic hook for updating entities
export function useUpdateEntity<T extends BaseEntity>(
  config: EntityConfig<T>,
  options?: UseMutationOptions<T, Error, Partial<T> & { id: string }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entityData: Partial<T> & { id: string }) => {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Apply pre-update transformations
      let processedData = entityData
      if (config.beforeUpdate) {
        const transformed = await config.beforeUpdate(entityData)
        processedData = { ...entityData, ...transformed }
      }

      const { id, ...updates } = processedData
      
      const { data, error } = await supabase
        .from(config.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      const result = (data as unknown) as T
      
      // Apply post-update actions
      if (config.afterUpdate) {
        await config.afterUpdate(result)
      }
      
      return result
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [config.queryKey] })
      queryClient.invalidateQueries({ queryKey: [config.queryKey, data.id] })
    },
    ...options,
  })
}

// Generic hook for deleting entities
export function useDeleteEntity<T extends BaseEntity>(
  config: EntityConfig<T>,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from(config.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Apply post-deletion actions
      if (config.afterDelete) {
        await config.afterDelete(id)
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [config.queryKey] })
    },
    ...options,
  })
}

// Unified loading and error state management
export interface EntityState<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  isSuccess: boolean
}

// Helper to extract common state from React Query results
export function getEntityState<T>(queryResult: any): EntityState<T> {
  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading || queryResult.isPending,
    isError: queryResult.isError,
    error: queryResult.error,
    isSuccess: queryResult.isSuccess,
  }
}