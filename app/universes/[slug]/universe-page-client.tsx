'use client'

import { useUniverse } from '@/hooks/use-universes'
import { useContentItems } from '@/hooks/use-content-items'
import { ContentTree } from '@/components/content-tree'
import { CreateContentModal } from '@/components/create-content-modal'
import { ManageContentTypesModal } from '@/components/manage-content-types-modal'
import { VersionHistoryPanel } from '@/components/version-history-panel'
import { EditUniverseModal } from '@/components/edit-universe-modal'
import { DeleteUniverseModal } from '@/components/delete-universe-modal'
import { useAuth } from '@/contexts/auth-context'
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
  const [showManageTypesModal, setShowManageTypesModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
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
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Universes
              </Link>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-sm">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>{user.user_metadata?.full_name || user.email}</span>
                <button
                  onClick={signOut}
                  className="text-red-600 hover:text-red-700 text-xs ml-1"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <h1 className="text-3xl font-bold">{universe.name}</h1>
            {universe.description && (
              <p className="text-gray-600 mt-2">
                {universe.description}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEditUniverse(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ✏️ Edit Universe
            </button>
            <button
              onClick={() => setShowDeleteUniverse(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🗑️ Delete Universe
            </button>
            <button
              onClick={() => setShowVersionHistory(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📋 Versions
            </button>
            <button
              onClick={() => setShowManageTypesModal(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ⚙️ Manage Types
            </button>
            {contentItems && contentItems.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Content
              </button>
            )}
          </div>
        </div>

        {contentLoading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading content...</div>
          </div>
        ) : contentItems && contentItems.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ContentTree items={contentItems} universeId={universe.id} />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 mb-4">
              No content items yet
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Your First Content Item
            </button>
          </div>
        )}

        {showCreateModal && (
          <CreateContentModal
            universeId={universe.id}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {showManageTypesModal && (
          <ManageContentTypesModal
            universeId={universe.id}
            onClose={() => setShowManageTypesModal(false)}
          />
        )}

        {showVersionHistory && (
          <VersionHistoryPanel
            universeId={universe.id}
            isOpen={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
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
      </div>
    </div>
  )
}