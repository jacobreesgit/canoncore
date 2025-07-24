'use client'

import { useUniverse } from '@/hooks/use-universes'
import { useContentItems } from '@/hooks/use-content-items'
import { ContentTree } from '@/components/content-tree'
import { CreateContentModal } from '@/components/create-content-modal'
import { EditUniverseModal } from '@/components/edit-universe-modal'
import { DeleteUniverseModal } from '@/components/delete-universe-modal'
import { DetailPageLayout } from '@/components/detail-page-layout'
import { UniverseVersionsCard } from '@/components/universe-versions-card'
import { ContentManagementCard } from '@/components/content-management-card'
import { DetailsCard } from '@/components/details-card'
import { DescriptionCard } from '@/components/description-card'
import { useAuth } from '@/contexts/auth-context'
import { ActionButton } from '@/components/ui/action-button'
import { useState } from 'react'
import Link from 'next/link'

interface UniversePageClientProps {
  slug: string
}

export function UniversePageClient({ slug }: UniversePageClientProps) {
  const { user, loading, signOut } = useAuth()
  const { data: universe, isLoading: universeLoading } = useUniverse(slug)
  const { data: contentItems, isLoading: contentLoading } = useContentItems(universe?.id || '')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditUniverse, setShowEditUniverse] = useState(false)
  const [showDeleteUniverse, setShowDeleteUniverse] = useState(false)

  if (loading || universeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
      backButton={
        <Link
          href="/"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Back to universes"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      }
      title={universe.name}
      subtitle="Universe"
      icon="🌌"
      actionButtons={
        <>
          {contentItems && contentItems.length > 0 && (
            <ActionButton
              onClick={() => setShowCreateModal(true)}
              variant="success"
              size="sm"
            >
              Add Content
            </ActionButton>
          )}
          <ActionButton
            onClick={() => setShowEditUniverse(true)}
            variant="primary"
            size="sm"
          >
            Edit Universe
          </ActionButton>
          <ActionButton
            onClick={() => setShowDeleteUniverse(true)}
            variant="danger"
            size="sm"
          >
            Delete Universe
          </ActionButton>
        </>
      }
      mainContent={
        contentLoading ? (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-center py-12">
              <div className="text-lg">Loading content...</div>
            </div>
          </div>
        ) : contentItems && contentItems.length > 0 ? (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Content ({contentItems.length})
            </h2>
            <ContentTree items={contentItems} universeId={universe.id} universeSlug={universe.slug} />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">
                No content items yet
              </div>
              <ActionButton
                onClick={() => setShowCreateModal(true)}
                variant="success"
              >
                Add Your First Content Item
              </ActionButton>
              <p className="text-xs text-gray-500 mt-4">
                Use the sidebar to manage content types and versions
              </p>
            </div>
          </div>
        )
      }
      detailsCard={
        <DetailsCard 
          items={[
            { label: 'Owner', value: user.user_metadata?.full_name || user.email },
            { label: 'Created', value: new Date(universe.created_at).toLocaleDateString() },
            { label: 'Updated', value: new Date(universe.updated_at).toLocaleDateString() },
            ...(contentItems ? [{ label: 'Items', value: contentItems.length }] : [])
          ]}
        />
      }
      descriptionCard={
        <DescriptionCard description={universe.description} />
      }
      versionsCard={
        <UniverseVersionsCard universeId={universe.id} />
      }
      additionalCards={[
        <ContentManagementCard key="content-management" universeId={universe.id} />,
        <div key="user-info" className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User</h2>
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium ${user.user_metadata?.avatar_url ? 'hidden' : ''}`}>
              {(user.user_metadata?.full_name || user.email || 'U')
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || user.email}</p>
              <ActionButton
                onClick={signOut}
                variant="danger"
                size="xs"
                className="text-xs"
              >
                Sign Out
              </ActionButton>
            </div>
          </div>
        </div>
      ]}
    >
      {/* Modals */}
      {showCreateModal && (
        <CreateContentModal
          universeId={universe.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}


      {showEditUniverse && (
        <EditUniverseModal
          universe={universe}
          onClose={() => setShowEditUniverse(false)}
        />
      )}

      {showDeleteUniverse && (
        <DeleteUniverseModal
          universe={universe}
          onClose={() => setShowDeleteUniverse(false)}
        />
      )}
    </DetailPageLayout>
  )
}