'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useContentDetailPageData } from '@/hooks/use-page-data'
import { ContentDetailPage } from '@/components/pages/content-detail-page'

interface ContentDetailPageClientProps {
  username: string
  universeSlug: string
  contentId: string // This is now a slug, not an ID
}

export function ContentDetailPageClient({ username, universeSlug, contentId }: ContentDetailPageClientProps) {
  const router = useRouter()
  const {
    user,
    authLoading,
    signOut,
    universe,
    universeLoading,
    contentItem,
    contentLoading,
    contentItems,
    allOrganisationTypes
  } = useContentDetailPageData(username, universeSlug, contentId)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)

  const handleBackToUniverse = () => {
    router.push(`/${username}/${universeSlug}`)
  }

  const handleDeleteSuccess = () => {
    handleBackToUniverse()
  }

  // Handle redirect for unauthenticated users
  if (!user && !authLoading) {
    router.push('/')
    return null
  }

  return (
    <ContentDetailPage
      user={user}
      universe={universe}
      contentItem={contentItem}
      contentItems={contentItems}
      allOrganisationTypes={allOrganisationTypes}
      username={username}
      universeSlug={universeSlug}
      contentId={contentId}
      authLoading={authLoading}
      universeLoading={universeLoading}
      contentLoading={contentLoading}
      onBackToUniverse={handleBackToUniverse}
      onShowEditModal={() => setShowEditModal(true)}
      onShowDeleteModal={() => setShowDeleteModal(true)}
      onShowAddChildModal={() => setShowAddChildModal(true)}
      onDeleteSuccess={handleDeleteSuccess}
      onSignOut={signOut}
      showEditModal={showEditModal}
      showDeleteModal={showDeleteModal}
      showAddChildModal={showAddChildModal}
      onCloseEditModal={() => setShowEditModal(false)}
      onCloseDeleteModal={() => setShowDeleteModal(false)}
      onCloseAddChildModal={() => setShowAddChildModal(false)}
    />
  )
}