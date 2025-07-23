'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useContentItems } from '@/hooks/use-content-items'
import { useUniverse } from '@/hooks/use-universes'
import { useAllContentTypes } from '@/hooks/use-custom-content-types'
import { useAuth } from '@/contexts/auth-context'
import { EditContentModal } from '@/components/edit-content-modal'
import { DeleteContentModal } from '@/components/delete-content-modal'
import { CreateContentModal } from '@/components/create-content-modal'
import { ContentItemWithChildren } from '@/types/database'

interface ContentDetailPageClientProps {
  universeSlug: string
  contentId: string
}

export function ContentDetailPageClient({ universeSlug, contentId }: ContentDetailPageClientProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)

  const { data: universe, isLoading: universeLoading } = useUniverse(universeSlug)
  const { data: contentItems, isLoading: contentLoading } = useContentItems(universe?.id || '')
  const { data: allContentTypes } = useAllContentTypes(universe?.id || '')

  // Find the specific content item
  const findContentItem = (items: ContentItemWithChildren[], targetId: string): ContentItemWithChildren | null => {
    for (const item of items) {
      if (item.id === targetId) return item
      if (item.children) {
        const found = findContentItem(item.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  const contentItem = contentItems ? findContentItem(contentItems, contentId) : null

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
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
          <button
            onClick={handleBackToUniverse}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Universe
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToUniverse}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to universe"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getItemIcon(contentItem.item_type)}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{contentItem.title}</h1>
                  <p className="text-gray-500">
                    {getItemTypeName(contentItem.item_type)} in {universe.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddChildModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Add Child
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              {contentItem.description ? (
                <p className="text-gray-700 leading-relaxed">{contentItem.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>

            {/* Children */}
            {contentItem.children && contentItem.children.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Children ({contentItem.children.length})
                </h2>
                <div className="space-y-3">
                  {contentItem.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/universes/${universeSlug}/content/${child.id}`)}
                    >
                      <span className="text-xl">{getItemIcon(child.item_type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{child.title}</h3>
                        <p className="text-sm text-gray-500">{getItemTypeName(child.item_type)}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Versions Placeholder */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Versions</h2>
              <p className="text-gray-500 italic">Content versions will be available in Phase 2.4</p>
            </div>

            {/* Relationships Placeholder */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Relationships</h2>
              <p className="text-gray-500 italic">Content relationships will be available in Phase 2.5</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-900 font-medium">{getItemTypeName(contentItem.item_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">{new Date(contentItem.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-900">{new Date(contentItem.updated_at).toLocaleDateString()}</span>
                </div>
                {contentItem.children && contentItem.children.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Children:</span>
                    <span className="text-gray-900">{contentItem.children.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  )
}