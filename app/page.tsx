'use client'

import { useAuth } from '@/contexts/auth-context'
import { useUniverses } from '@/hooks/use-universes'
import { UniverseCard } from '@/components/universe-card'
import { CreateUniverseModal } from '@/components/create-universe-modal'
import { useState } from 'react'

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth()
  const { data: universes, isLoading: universesLoading } = useUniverses()
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">CanonCore</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Content organisation platform for expanded universes
          </p>
          <button
            onClick={signInWithGoogle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Universes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user.user_metadata?.full_name || user.email}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Universe
          </button>
        </div>

        {universesLoading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading universes...</div>
          </div>
        ) : universes && universes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universes.map(universe => (
              <UniverseCard key={universe.id} universe={universe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              You haven't created any universes yet
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Your First Universe
            </button>
          </div>
        )}

        {showCreateModal && (
          <CreateUniverseModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    </div>
  )
}
