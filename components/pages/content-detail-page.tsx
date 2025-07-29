'use client'

import { useSearchParams } from 'next/navigation'
import { EditContentModal, DeleteContentModal, CreateContentModal, ContentTree, ContentVersionsCard, ManagePlacementsModal } from '@/components/content'
import { DetailPageLayout, DetailsCard, RelationshipsCard } from '@/components/shared'
import { ActionButton, Card, LoadingWrapper, SectionHeader, HStack, PageHeader } from '@/components/ui'
import { findItemWithChildren, countAllChildren, getOrganisationTypeName } from '@/lib/page-utils'
import type { Universe, ContentItemWithChildren } from '@/types/database'

interface ContentDetailPageProps {
  // Data
  user: any
  universe: Universe | undefined
  contentItem: ContentItemWithChildren | undefined
  contentItems: ContentItemWithChildren[] | undefined
  allOrganisationTypes: Array<{ id: string; name: string } | { readonly id: string; readonly name: string }> | undefined
  username: string
  universeSlug: string
  contentId: string
  
  // Loading states
  authLoading: boolean
  universeLoading: boolean
  contentLoading: boolean
  
  // Actions
  onBackToUniverse: () => void
  onShowEditModal: () => void
  onShowDeleteModal: () => void
  onShowAddChildModal: () => void
  onShowManagePlacementsModal: () => void
  onDeleteSuccess: () => void
  onSignOut?: () => void
  
  // Modal states
  showEditModal: boolean
  showDeleteModal: boolean
  showAddChildModal: boolean
  showManagePlacementsModal: boolean
  onCloseEditModal: () => void
  onCloseDeleteModal: () => void
  onCloseAddChildModal: () => void
  onCloseManagePlacementsModal: () => void
}

export function ContentDetailPage({
  user,
  universe,
  contentItem,
  contentItems,
  allOrganisationTypes,
  username,
  universeSlug,
  contentId,
  authLoading,
  universeLoading,
  contentLoading,
  onBackToUniverse,
  onShowEditModal,
  onShowDeleteModal,
  onShowAddChildModal,
  onShowManagePlacementsModal,
  onDeleteSuccess,
  onSignOut,
  showEditModal,
  showDeleteModal,
  showAddChildModal,
  showManagePlacementsModal,
  onCloseEditModal,
  onCloseDeleteModal,
  onCloseAddChildModal,
  onCloseManagePlacementsModal
}: ContentDetailPageProps) {
  // Check if accessed from public browsing context (must be called at top level)
  const searchParams = useSearchParams()
  const fromPublic = searchParams.get('from') === 'public'
  
  if (authLoading || universeLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Loading content..." 
          message="Please wait while we fetch the content details"
        >
          <div />
        </LoadingWrapper>
      </div>
    )
  }

  if (!user) {
    return null // Will be handled by redirect in container
  }

  if (!universe || !contentItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PageHeader
            title="Content Not Found"
            subtitle="The content item you're looking for doesn't exist."
            size="md"
            className="mb-6"
          />
          <ActionButton
            onClick={onBackToUniverse}
            variant="primary"
          >
            Back to Universe
          </ActionButton>
        </div>
      </div>
    )
  }

  // Find children from the hierarchical tree
  const contentItemWithChildren = contentItems && contentItem ? findItemWithChildren(contentItems, contentItem.id) : null
  const itemTypeName = getOrganisationTypeName(contentItem.item_type, allOrganisationTypes)

  return (
    <DetailPageLayout
      title={contentItem.title}
      user={user}
      onSignOut={onSignOut || (() => {})}
      isUserPage={false}
      breadcrumbs={fromPublic ? [
        { label: 'Public Universes', href: '/public-universes' },
        { label: universe?.name || '', href: `/${username}/${universeSlug}?from=public` },
        { label: contentItem.title }
      ] : [
        { label: 'Universes', href: `/${username}` },
        { label: universe?.name || '', href: `/${username}/${universeSlug}` },
        { label: contentItem.title }
      ]}
      mainContent={
        <Card>
          {contentItemWithChildren?.children && contentItemWithChildren.children.length > 0 ? (
            <ContentTree 
              items={contentItemWithChildren.children} 
              universeId={universe.id} 
              universeSlug={universeSlug}
              username={username}
              fromPublic={fromPublic}
              renderSelectionControls={(selectionActions, isSelectionMode, viewToggle) => (
                <SectionHeader 
                  title={`Children (${countAllChildren(contentItemWithChildren.children || [])})`}
                  level={2}
                  actions={
                    <HStack spacing="sm">
                      {/* View Toggle - hide during selection */}
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No children yet</p>
            </div>
          )}
        </Card>
      }
      sidebarCards={[
        <DetailsCard 
          key="details"
          items={[
            { label: 'Type', value: itemTypeName },
            { label: 'Created', value: new Date(contentItem.created_at).toLocaleDateString() },
            { label: 'Updated', value: new Date(contentItem.updated_at).toLocaleDateString() }
          ]}
          actions={
            <>
              <ActionButton
                onClick={onShowAddChildModal}
                variant="primary"
                size="sm"
                fullWidth
              >
                Add Child
              </ActionButton>
              <ActionButton
                onClick={onShowManagePlacementsModal}
                variant="info"
                size="sm"
                fullWidth
              >
                Manage Placements
              </ActionButton>
              <ActionButton
                onClick={onShowEditModal}
                variant="primary"
                size="sm"
                fullWidth
              >
                Edit {itemTypeName}
              </ActionButton>
              <ActionButton
                onClick={onShowDeleteModal}
                variant="danger"
                size="sm"
                fullWidth
              >
                Delete {itemTypeName}
              </ActionButton>
            </>
          }
        />,
        <Card key="description">
          <SectionHeader title="Description" level={3} />
          {contentItem.description ? (
            <p className="text-gray-700 leading-relaxed">{contentItem.description}</p>
          ) : (
            <p className="text-gray-500 italic">No description provided</p>
          )}
        </Card>,
        <ContentVersionsCard key="versions" contentItemId={contentItem.id} />,
        <RelationshipsCard 
          key="relationships" 
          contentItemId={contentItem.id}
          universeId={universe.id}
          username={username}
          universeSlug={universeSlug}
        />
      ]}
    >
      {/* Modals */}
      {showEditModal && (
        <EditContentModal
          item={contentItem}
          onClose={onCloseEditModal}
        />
      )}

      {showDeleteModal && (
        <DeleteContentModal
          item={contentItem}
          onClose={onCloseDeleteModal}
          onSuccess={onDeleteSuccess}
        />
      )}

      {showAddChildModal && (
        <CreateContentModal
          universeId={universe.id}
          parentId={contentItem.id}
          onClose={onCloseAddChildModal}
        />
      )}

      {showManagePlacementsModal && (
        <ManagePlacementsModal
          contentItem={contentItem}
          onClose={onCloseManagePlacementsModal}
        />
      )}
    </DetailPageLayout>
  )
}