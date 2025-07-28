import { useAuth } from '@/contexts/auth-context'
import { useUniverse, useUniverses } from '@/hooks/use-universes'
import { useContentItems, useContentItemBySlug } from '@/hooks/use-content-items'
import { useAllOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { getCurrentUsername } from '@/lib/username-utils'

/**
 * Data fetching hook for user universes page
 */
export function useUserUniversesPageData(username: string) {
  const { user, loading: authLoading, signOut } = useAuth()
  const { data: universes, isPending, isFetching } = useUniverses()
  
  const currentUserUsername = getCurrentUsername(user)
  const isOwnProfile = currentUserUsername === username
  
  // Only show loading if we have no data AND we're actually fetching
  const universesLoading = isPending && isFetching
  
  return {
    user,
    authLoading,
    signOut,
    universes,
    universesLoading,
    currentUserUsername,
    isOwnProfile
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