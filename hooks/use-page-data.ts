import { useAuth } from '@/contexts/auth-context'
import { useUniverse, useUniverses } from '@/hooks/use-universes'
import { useContentItems, useContentItemBySlug } from '@/hooks/use-content-items'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { extractUsernameFromEmail } from '@/lib/username'

/**
 * Data fetching hook for user universes page
 */
export function useUserUniversesPageData(username: string) {
  const { user, loading: authLoading, signOut } = useAuth()
  const { data: universes, isLoading: universesLoading } = useUniverses()
  
  const currentUserUsername = user?.email ? extractUsernameFromEmail(user.email) : null
  const isOwnProfile = currentUserUsername === username
  
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
  const { data: contentItems, isLoading: contentLoading } = useContentItems(universe?.id || '')
  
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
  const { data: allContentTypes } = useAllContentTypes(universe?.id || '')
  
  return {
    user,
    authLoading,
    signOut,
    universe,
    universeLoading,
    contentItem,
    contentLoading,
    contentItems,
    allContentTypes
  }
}