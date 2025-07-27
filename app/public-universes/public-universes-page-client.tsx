'use client'

import { usePublicUniverses } from '@/hooks/use-universes'
import { useAuth } from '@/contexts/auth-context'
import { PublicUniversesPage } from '@/components/pages/public-universes-page'
import { useRouter } from 'next/navigation'
import type { Universe } from '@/types/database'

export function PublicUniversesPageClient() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const { data: universes, isLoading: universesLoading } = usePublicUniverses()

  // Handle redirect for unauthenticated users
  if (!user && !authLoading) {
    router.push('/')
    return null
  }

  // Type assertion to handle the extended universe type
  const typedUniverses = (universes || []) as (Universe & { profiles: { full_name: string } | null })[]

  return (
    <PublicUniversesPage
      user={user}
      universes={typedUniverses}
      authLoading={authLoading}
      universesLoading={universesLoading}
      onSignOut={signOut}
    />
  )
}