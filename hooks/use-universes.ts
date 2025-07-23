import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Universe } from '@/types/database'
import { v4 as uuidv4 } from 'uuid'

export function useUniverses() {
  return useQuery({
    queryKey: ['universes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Universe[]
    },
  })
}

export function useCreateUniverse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (universe: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const slug = universe.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data, error } = await supabase
        .from('universes')
        .insert({
          id: uuidv4(),
          name: universe.name,
          slug,
          description: universe.description,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Universe
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universes'] })
    },
  })
}

export function useUniverse(slug: string) {
  return useQuery({
    queryKey: ['universe', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universes')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data as Universe
    },
    enabled: Boolean(slug),
  })
}

export function useUpdateUniverse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; description?: string } }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const updateData: any = { ...updates }
      
      // Generate new slug if name is being updated
      if (updates.name) {
        updateData.slug = updates.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }

      const { data, error } = await supabase
        .from('universes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as Universe
    },
    onSuccess: (updatedUniverse) => {
      queryClient.invalidateQueries({ queryKey: ['universes'] })
      queryClient.invalidateQueries({ queryKey: ['universe', updatedUniverse.slug] })
    },
  })
}

export function useDeleteUniverse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('universes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universes'] })
    },
  })
}