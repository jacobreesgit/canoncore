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