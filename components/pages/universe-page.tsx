'use client'

import { ContentTree, CreateContentModal, ContentManagementCard } from '@/components/content'
import { EditUniverseModal, DeleteUniverseModal, UniverseVersionsCard } from '@/components/universe'
import { DetailPageLayout, DetailsCard, DescriptionCard } from '@/components/shared'
import { ActionButton, Card, LoadingPlaceholder, SectionHeader } from '@/components/ui'
import { countAllChildren } from '@/lib/page-utils'
import type { Universe, ContentItemWithChildren } from '@/types/database'

interface UniversePageProps {
  // Data
  user: any
  universe: Universe | undefined
  contentItems: ContentItemWithChildren[] | undefined
  username: string
  slug: string
  
  // Loading states
  authLoading: boolean
  universeLoading: boolean
  contentLoading: boolean
  
  // Actions
  onSignOut: () => void
  onShowCreateModal: () => void
  onShowEditUniverse: () => void
  onShowDeleteUniverse: () => void
  
  // Modal states
  showCreateModal: boolean
  showEditUniverse: boolean
  showDeleteUniverse: boolean
  onCloseCreateModal: () => void
  onCloseEditUniverse: () => void
  onCloseDeleteUniverse: () => void
}

export function UniversePage({
  user,
  universe,
  contentItems,
  username,
  slug,
  authLoading,
  universeLoading,
  contentLoading,
  onSignOut,
  onShowCreateModal,
  onShowEditUniverse,
  onShowDeleteUniverse,
  showCreateModal,
  showEditUniverse,
  showDeleteUniverse,
  onCloseCreateModal,
  onCloseEditUniverse,
  onCloseDeleteUniverse
}: UniversePageProps) {
  if (authLoading || universeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPlaceholder title="Loading universe..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Please sign in to view this universe</div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!universe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Universe not found</div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DetailPageLayout
      title={universe.name}
      subtitle="Universe"
      icon="🌌"
      user={user}
      onSignOut={onSignOut}
      pageActions={
        <ActionButton
          onClick={onShowCreateModal}
          variant="primary"
          size="sm"
          fullWidth
        >
          Add Content
        </ActionButton>
      }
      mainContent={
        contentLoading ? (
          <Card>
            <LoadingPlaceholder title="Loading content..." />
          </Card>
        ) : contentItems && contentItems.length > 0 ? (
          <Card>
            <SectionHeader 
              title={`Content (${countAllChildren(contentItems)})`}
              level={2}
            />
            <ContentTree items={contentItems} universeId={universe.id} universeSlug={universe.slug} username={username} />
          </Card>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">
                No content items yet
              </div>
              <ActionButton
                onClick={onShowCreateModal}
                variant="success"
              >
                Add Your First Content Item
              </ActionButton>
              <p className="text-xs text-gray-500 mt-4">
                Use the sidebar to manage content types and versions
              </p>
            </div>
          </Card>
        )
      }
      sidebarCards={[
        <DetailsCard 
          key="details"
          items={[
            { label: 'Owner', value: user.user_metadata?.full_name || user.email },
            { label: 'Created', value: new Date(universe.created_at).toLocaleDateString() },
            { label: 'Updated', value: new Date(universe.updated_at).toLocaleDateString() }
          ]}
          actions={
            <>
              <ActionButton
                onClick={onShowEditUniverse}
                variant="primary"
                size="sm"
                fullWidth
              >
                Edit Universe
              </ActionButton>
              <ActionButton
                onClick={onShowDeleteUniverse}
                variant="danger"
                size="sm"
                fullWidth
              >
                Delete Universe
              </ActionButton>
            </>
          }
        />,
        <DescriptionCard key="description" description={universe.description} />,
        <UniverseVersionsCard key="versions" universeId={universe.id} />,
        <ContentManagementCard key="content-management" universeId={universe.id} />
      ]}
    >
      {/* Modals */}
      {showCreateModal && (
        <CreateContentModal
          universeId={universe.id}
          onClose={onCloseCreateModal}
        />
      )}

      {showEditUniverse && (
        <EditUniverseModal
          universe={universe}
          onClose={onCloseEditUniverse}
        />
      )}

      {showDeleteUniverse && (
        <DeleteUniverseModal
          universe={universe}
          onClose={onCloseDeleteUniverse}
        />
      )}
    </DetailPageLayout>
  )
}