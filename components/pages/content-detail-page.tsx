'use client'

import { EditContentModal, DeleteContentModal, CreateContentModal, ContentTree, ContentVersionsCard } from '@/components/content'
import { DetailPageLayout, DetailsCard, RelationshipsCard } from '@/components/shared'
import { ActionButton, IconButton, ChevronLeftIcon, Card, LoadingPlaceholder } from '@/components/ui'
import { getContentTypeName, findItemWithChildren, buildHierarchyContext } from '@/lib/page-utils'
import type { Universe, ContentItemWithChildren } from '@/types/database'

interface ContentDetailPageProps {
  // Data
  user: any
  universe: Universe | undefined
  contentItem: ContentItemWithChildren | undefined
  contentItems: ContentItemWithChildren[] | undefined
  allContentTypes: Array<{ id: string; name: string } | { readonly id: string; readonly name: string }> | undefined
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
  onDeleteSuccess: () => void
  
  // Modal states
  showEditModal: boolean
  showDeleteModal: boolean
  showAddChildModal: boolean
  onCloseEditModal: () => void
  onCloseDeleteModal: () => void
  onCloseAddChildModal: () => void
}

export function ContentDetailPage({
  user,
  universe,
  contentItem,
  contentItems,
  allContentTypes,
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
  onDeleteSuccess,
  showEditModal,
  showDeleteModal,
  showAddChildModal,
  onCloseEditModal,
  onCloseDeleteModal,
  onCloseAddChildModal
}: ContentDetailPageProps) {
  if (authLoading || universeLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingPlaceholder 
          title="Loading content..." 
          message="Please wait while we fetch the content details"
        />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
          <p className="text-gray-600 mb-6">The content item you&apos;re looking for doesn&apos;t exist.</p>
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
  const itemTypeName = getContentTypeName(contentItem.item_type, allContentTypes)
  const hierarchyContext = buildHierarchyContext(contentItemWithChildren || contentItem, contentItems || [], universe?.name || '')

  return (
    <DetailPageLayout
      backButton={
        <IconButton
          onClick={onBackToUniverse}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          aria-label="Back to universe"
          title="Back to universe"
        >
          <ChevronLeftIcon />
        </IconButton>
      }
      title={contentItem.title}
      subtitle={`${itemTypeName} in ${hierarchyContext}`}
      actionButtons={
        <>
          <ActionButton
            onClick={onShowAddChildModal}
            variant="success"
            size="sm"
          >
            Add Child
          </ActionButton>
          <ActionButton
            onClick={onShowEditModal}
            variant="primary"
            size="sm"
          >
            Edit {itemTypeName}
          </ActionButton>
          <ActionButton
            onClick={onShowDeleteModal}
            variant="danger"
            size="sm"
          >
            Delete {itemTypeName}
          </ActionButton>
        </>
      }
      mainContent={
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Children {contentItemWithChildren?.children ? `(${contentItemWithChildren.children.length})` : '(0)'}
          </h2>
          {contentItemWithChildren?.children && contentItemWithChildren.children.length > 0 ? (
            <ContentTree 
              items={contentItemWithChildren.children} 
              universeId={universe.id} 
              universeSlug={universeSlug}
              username={username}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No children yet</p>
              <ActionButton
                onClick={onShowAddChildModal}
                variant="success"
              >
                Add First Child
              </ActionButton>
            </div>
          )}
        </Card>
      }
      detailsCard={
        <DetailsCard 
          items={[
            { label: 'Type', value: itemTypeName },
            { label: 'Created', value: new Date(contentItem.created_at).toLocaleDateString() },
            { label: 'Updated', value: new Date(contentItem.updated_at).toLocaleDateString() },
            ...(contentItemWithChildren?.children && contentItemWithChildren.children.length > 0 
              ? [{ label: 'Children', value: contentItemWithChildren.children.length }] 
              : [])
          ]}
        />
      }
      descriptionCard={
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          {contentItem.description ? (
            <p className="text-gray-700 leading-relaxed">{contentItem.description}</p>
          ) : (
            <p className="text-gray-500 italic">No description provided</p>
          )}
        </Card>
      }
      versionsCard={
        <ContentVersionsCard contentItemId={contentItem.id} />
      }
      relationshipsCard={
        <RelationshipsCard />
      }
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
    </DetailPageLayout>
  )
}