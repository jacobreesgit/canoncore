'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ContentTree, CreateContentModal, ContentManagementCard, ContentRelationshipTypesCard } from '@/components/content'
import { EditUniverseModal, DeleteUniverseModal, UniverseVersionsCard } from '@/components/universe'
import { UniverseLayout, DetailsCard, DescriptionCard } from '@/components/shared'
import { ActionButton, Card, LoadingWrapper, SectionHeader, HStack, PublicPrivateBadge } from '@/components/ui'
import { countAllChildren } from '@/lib/page-utils'
import type { Universe, ContentItemWithChildren } from '@/types/database'

type UniverseWithOwner = Universe & {
  profiles?: {
    full_name: string | null
    username: string | null
  } | null
}

interface UniversePageProps {
  // Data
  user: any
  universe: UniverseWithOwner | undefined
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
  // Check if accessed from public browsing context (must be called at top level)
  const searchParams = useSearchParams()
  const fromPublic = searchParams.get('from') === 'public'
  if (authLoading || universeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Loading universe..."
        >
          <div />
        </LoadingWrapper>
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

  // Create a user object for the universe owner (for sidebar display)
  // This should ALWAYS represent the universe owner, not the current logged-in user
  const universeOwner = {
    id: universe.user_id, // Include user ID for profile fetching
    email: `${universe.username}@placeholder.com`, // For username generation
    user_metadata: {
      full_name: universe.profiles?.full_name || null,
      username: universe.profiles?.username || universe.username,
    }
  }

  return (
    <UniverseLayout
      title={universe.name}
      universeOwner={universeOwner}
      currentUser={user}
      onSignOut={onSignOut}
      isUserPage={false}
      breadcrumbs={fromPublic ? [
        { label: 'Public Universes', href: '/public-universes' },
        { label: universe.name }
      ] : [
        { label: 'Universes', href: `/${username}` },
        { label: universe.name }
      ]}
      mainContent={
        contentLoading ? (
          <Card>
            <LoadingWrapper 
              isLoading={true}
              fallback="placeholder"
              title="Loading content..."
            >
              <div />
            </LoadingWrapper>
          </Card>
        ) : contentItems && contentItems.length > 0 ? (
          <Card>
            <ContentTree 
              items={contentItems} 
              universeId={universe.id} 
              universeSlug={universe.slug} 
              username={username}
              fromPublic={fromPublic}
              renderSelectionControls={(selectionActions, isSelectionMode, viewToggle) => (
                <SectionHeader 
                  title={`Content (${countAllChildren(contentItems)})`}
                  level={2}
                  actions={
                    <HStack spacing="sm">
                      {/* View Toggle - Card view only for detail pages - hide during selection */}
                      {!isSelectionMode && viewToggle}
                      
                      {/* Selection Controls */}
                      {!isSelectionMode ? (
                        <ActionButton
                          onClick={selectionActions?.enterSelectionMode}
                          variant="primary"
                          size="sm"
                        >
                          Select
                        </ActionButton>
                      ) : (
                        <>
                          <ActionButton
                            onClick={selectionActions?.selectAll}
                            variant="primary"
                            size="sm"
                          >
                            Select All
                          </ActionButton>
                          <ActionButton
                            onClick={selectionActions?.clearSelection}
                            variant="info"
                            size="sm"
                          >
                            Clear All
                          </ActionButton>
                          <ActionButton
                            onClick={selectionActions?.exitSelectionMode}
                            variant="info"
                            size="sm"
                          >
                            Cancel Selection
                          </ActionButton>
                        </>
                      )}
                    </HStack>
                  }
                />
              )}
              defaultViewMode="tree"
              showViewToggle={true}
            />
          </Card>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">
                No content items yet
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Use the sidebar to manage organisation types and versions
              </p>
            </div>
          </Card>
        )
      }
      sidebarCards={[
        <DetailsCard 
          key="details"
          items={[
            { label: 'Owner', value: universe.username },
            { label: 'Visibility', value: <PublicPrivateBadge isPublic={universe.is_public} /> },
            { label: 'Created', value: new Date(universe.created_at).toLocaleDateString() },
            { label: 'Updated', value: new Date(universe.updated_at).toLocaleDateString() }
          ]}
          actions={
            <>
              <ActionButton
                onClick={onShowCreateModal}
                variant="primary"
                size="sm"
                fullWidth
              >
                Add Content
              </ActionButton>
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
        <ContentManagementCard key="content-management" universeId={universe.id} />,
        <ContentRelationshipTypesCard key="relationship-types" universeId={universe.id} />
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
          username={username}
          onClose={onCloseEditUniverse}
        />
      )}

      {showDeleteUniverse && (
        <DeleteUniverseModal
          universe={universe}
          onClose={onCloseDeleteUniverse}
        />
      )}
    </UniverseLayout>
  )
}