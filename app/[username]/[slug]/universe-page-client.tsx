'use client'

import { useUniversePageData } from '@/hooks/use-page-data'
import { UniversePage } from '@/components/pages/universe-page'
import { useState } from 'react'

interface UniversePageClientProps {
  username: string
  slug: string
}

export function UniversePageClient({ username, slug }: UniversePageClientProps) {
  const {
    user,
    authLoading,
    signOut,
    universe,
    universeLoading,
    contentItems,
    contentLoading
  } = useUniversePageData(username, slug)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditUniverse, setShowEditUniverse] = useState(false)
  const [showDeleteUniverse, setShowDeleteUniverse] = useState(false)

  return (
    <UniversePage
      user={user}
      universe={universe}
      contentItems={contentItems}
      username={username}
      slug={slug}
      authLoading={authLoading}
      universeLoading={universeLoading}
      contentLoading={contentLoading}
      onSignOut={signOut}
      onShowCreateModal={() => setShowCreateModal(true)}
      onShowEditUniverse={() => setShowEditUniverse(true)}
      onShowDeleteUniverse={() => setShowDeleteUniverse(true)}
      showCreateModal={showCreateModal}
      showEditUniverse={showEditUniverse}
      showDeleteUniverse={showDeleteUniverse}
      onCloseCreateModal={() => setShowCreateModal(false)}
      onCloseEditUniverse={() => setShowEditUniverse(false)}
      onCloseDeleteUniverse={() => setShowDeleteUniverse(false)}
    />
  )
}