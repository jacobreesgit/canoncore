import { useAuth } from '@/contexts/auth-context'
import { useUniverse, useUniverses } from '@/hooks/use-universes'
import { useContentItems, useContentItemBySlug } from '@/hooks/use-content-items'
import { useAllOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { getCurrentUsername } from '@/lib/username-utils'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Hook to fetch universes for a specific username
 */
function useUniversesByUsername(username: string) {
  return useQuery({
    queryKey: ['universes', 'by-username', username],
    queryFn: async () => {
      // First check if the profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq('username', username)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No rows returned - user doesn't exist
          return { userExists: false, universes: [], profile: null }
        }
        throw profileError
      }

      // User exists, now fetch their public universes
      const { data: universes, error: universesError } = await supabase
        .from('universes')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (universesError) throw universesError

      return { 
        userExists: true, 
        universes: universes || [], 
        profile 
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Data fetching hook for user universes page
 */
export function useUserUniversesPageData(username: string) {
  const { user, loading: authLoading, signOut } = useAuth()
  const currentUserUsername = getCurrentUsername(user)
  const isOwnProfile = currentUserUsername === username
  
  // If viewing own profile, use existing useUniverses hook (shows all universes)
  const ownUniversesQuery = useUniverses()
  
  // If viewing someone else's profile, use new hook (shows only public universes)
  const otherUserQuery = useUniversesByUsername(username)
  
  // Choose which query to use based on ownership
  const activeQuery = isOwnProfile ? ownUniversesQuery : otherUserQuery
  
  // Extract data from the appropriate query
  const universes = isOwnProfile 
    ? ownUniversesQuery.data || []
    : otherUserQuery.data?.universes || []
    
  const userExists = isOwnProfile 
    ? true // Current user always exists
    : otherUserQuery.data?.userExists ?? true // Default to true while loading
    
  const targetProfile = isOwnProfile 
    ? null // We don't need profile data for own page
    : otherUserQuery.data?.profile || null
    
  const universesLoading = activeQuery.isPending && activeQuery.isFetching
  
  return {
    user,
    authLoading,
    signOut,
    universes,
    universesLoading,
    currentUserUsername,
    isOwnProfile,
    userExists,
    targetProfile
  }
}

/**
 * Data fetching hook for universe detail page
 */
export function useUniversePageData(username: string, slug: string) {
  const { user, loading: authLoading, signOut } = useAuth()
  const { data: universe, isLoading: universeLoading } = useUniverse(username, slug)
  
  // Only fetch content items if we have a valid universe ID
  const { data: contentItems, isLoading: contentLoading } = useContentItems(universe?.id || '', {
    enabled: !!universe?.id
  })
  
  return {
    user,
    authLoading,
    signOut,
    universe,
    universeLoading,
    contentItems,
    contentLoading
  }
}

/**
 * Data fetching hook for content detail page
 */
export function useContentDetailPageData(username: string, universeSlug: string, contentId: string) {
  const { user, loading: authLoading, signOut } = useAuth()
  const { data: universe, isLoading: universeLoading } = useUniverse(username, universeSlug)
  const { data: contentItem, isLoading: contentLoading } = useContentItemBySlug(universe?.id || '', contentId)
  const { data: contentItems } = useContentItems(universe?.id || '')
  const { data: allOrganisationTypes } = useAllOrganisationTypes(universe?.id || '')
  
  return {
    user,
    authLoading,
    signOut,
    universe,
    universeLoading,
    contentItem,
    contentLoading,
    contentItems,
    allOrganisationTypes
  }
}