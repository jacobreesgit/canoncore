'use client'

import { useUserUniversesPageData } from '@/hooks/use-page-data'
import { UserUniversesPage } from '@/components/pages/user-universes-page'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserUniversesPageClientProps {
  username: string
}

export function UserUniversesPageClient({ username }: UserUniversesPageClientProps) {
  const {
    user,
    authLoading,
    signOut,
    universes,
    universesLoading,
    isOwnProfile
  } = useUserUniversesPageData(username)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  return (
    <UserUniversesPage
      user={user}
      universes={universes}
      username={username}
      isOwnProfile={isOwnProfile}
      authLoading={authLoading}
      universesLoading={universesLoading}
      onSignOut={signOut}
      onShowCreateModal={() => setShowCreateModal(true)}
      onShowDeleteAccountModal={() => setShowDeleteAccountModal(true)}
      showCreateModal={showCreateModal}
      showDeleteAccountModal={showDeleteAccountModal}
      onCloseCreateModal={() => setShowCreateModal(false)}
      onCloseDeleteAccountModal={() => setShowDeleteAccountModal(false)}
    />
  )
}