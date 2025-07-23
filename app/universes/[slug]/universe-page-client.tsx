'use client'

import { useUniverse } from '@/hooks/use-universes'
import { useContentItems } from '@/hooks/use-content-items'
import { ContentTree } from '@/components/content-tree'
import { CreateContentModal } from '@/components/create-content-modal'
import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'
import Link from 'next/link'

interface UniversePageClientProps {
  slug: string
}

export function UniversePageClient({ slug }: UniversePageClientProps) {
  const { user, loading } = useAuth()
  const { data: universe, isLoading: universeLoading } = useUniverse(slug)
  const { data: contentItems, isLoading: contentLoading } = useContentItems(universe?.id || '')
  const [showCreateModal, setShowCreateModal] = useState(false)

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
            </div>
            <h1 className="text-3xl font-bold">{universe.name}</h1>
            {universe.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {universe.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Content
          </button>
        </div>

        {contentLoading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading content...</div>
          </div>
        ) : contentItems && contentItems.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <ContentTree items={contentItems} universeId={universe.id} />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
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
      </div>
    </div>
  )
}