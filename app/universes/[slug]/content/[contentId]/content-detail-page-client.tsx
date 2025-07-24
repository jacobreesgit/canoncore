'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useContentItems, useContentItemBySlug } from '@/hooks/use-content-items'
import { useUniverse } from '@/hooks/use-universes'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { useAuth } from '@/contexts/auth-context'
import { EditContentModal } from '@/components/edit-content-modal'
import { DeleteContentModal } from '@/components/delete-content-modal'
import { CreateContentModal } from '@/components/create-content-modal'
import { ContentTree } from '@/components/content-tree'
import { ContentVersionsCard } from '@/components/content-versions-card'
import { DetailPageLayout } from '@/components/detail-page-layout'
import { DetailsCard } from '@/components/details-card'
import { RelationshipsCard } from '@/components/relationships-card'
import { ContentItemWithChildren } from '@/types/database'
import { ActionButton } from '@/components/ui/action-button'
import { IconButton, ChevronLeftIcon } from '@/components/ui/icon-button'
import { Card, LoadingPlaceholder } from '@/components/ui'

interface ContentDetailPageClientProps {
  universeSlug: string
  contentId: string // This is now a slug, not an ID
}

export function ContentDetailPageClient({ universeSlug, contentId }: ContentDetailPageClientProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)

  const { data: universe, isLoading: universeLoading } = useUniverse(universeSlug)
  const { data: contentItem, isLoading: contentLoading } = useContentItemBySlug(universe?.id || '', contentId)
  const { data: contentItems } = useContentItems(universe?.id || '') // Still needed for children
  const { data: allContentTypes } = useAllContentTypes(universe?.id || '')

  // Find children from the hierarchical tree
  const findItemWithChildren = (items: ContentItemWithChildren[], targetId: string): ContentItemWithChildren | null => {
    for (const item of items) {
      if (item.id === targetId) return item
      if (item.children) {
        const found = findItemWithChildren(item.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  const contentItemWithChildren = contentItems && contentItem ? findItemWithChildren(contentItems, contentItem.id) : null

  const getItemIcon = (itemType: string) => {
    // First, check if it's a custom type
    const customType = allContentTypes?.find(type => type.id === itemType)
    if (customType) {
      return customType.emoji
    }
    
    // Fallback to built-in types
    switch (itemType) {
      case 'film': return '🎬'
      case 'book': return '📚'
      case 'serial': return '📽️'
      case 'series': return '📺'
      case 'show': return '🎭'
      case 'collection': return '📦'
      case 'character': return '👤'
      case 'location': return '🗺️'
      case 'event': return '⚡'
      case 'documentary': return '🎥'
      case 'short': return '🎞️'
      case 'special': return '⭐'
      case 'audio_drama': return '🎧'
      case 'minisode': return '📱'
      default: return '📄'
    }
  }

  const getItemTypeName = (itemType: string) => {
    // First, check if it's a custom type
    const customType = allContentTypes?.find(type => type.id === itemType)
    if (customType) {
      return customType.name
    }
    
    // Fallback to built-in type names
    return itemType.charAt(0).toUpperCase() + itemType.slice(1).replace('_', ' ')
  }

  const handleBackToUniverse = () => {
    router.push(`/universes/${universeSlug}`)
  }

  const handleDeleteSuccess = () => {
    // Navigate back to universe after successful deletion
    handleBackToUniverse()
  }

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
    router.push('/')
    return null
  }

  if (!universe || !contentItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
          <p className="text-gray-600 mb-6">The content item you're looking for doesn't exist.</p>
          <ActionButton
            onClick={handleBackToUniverse}
            variant="primary"
          >
            Back to Universe
          </ActionButton>
        </div>
      </div>
    )
  }

  return (
    <DetailPageLayout
      backButton={
        <IconButton
          onClick={handleBackToUniverse}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          aria-label="Back to universe"
          title="Back to universe"
        >
          <ChevronLeftIcon />
        </IconButton>
      }
      title={contentItem.title}
      subtitle={`${getItemTypeName(contentItem.item_type)} in ${universe.name}`}
      icon={getItemIcon(contentItem.item_type)}
      actionButtons={
        <>
          <ActionButton
            onClick={() => setShowAddChildModal(true)}
            variant="success"
            size="sm"
          >
            Add Child
          </ActionButton>
          <ActionButton
            onClick={() => setShowEditModal(true)}
            variant="primary"
            size="sm"
          >
            Edit {getItemTypeName(contentItem.item_type)}
          </ActionButton>
          <ActionButton
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
            size="sm"
          >
            Delete {getItemTypeName(contentItem.item_type)}
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
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No children yet</p>
              <ActionButton
                onClick={() => setShowAddChildModal(true)}
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
            { label: 'Type', value: getItemTypeName(contentItem.item_type) },
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
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteContentModal
          item={contentItem}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {showAddChildModal && (
        <CreateContentModal
          universeId={universe.id}
          parentId={contentItem.id}
          onClose={() => setShowAddChildModal(false)}
        />
      )}
    </DetailPageLayout>
  )
}