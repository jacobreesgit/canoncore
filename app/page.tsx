'use client'

import { useAuth } from '@/contexts/auth-context'
import { useUniverses } from '@/hooks/use-universes'
import { UniverseCard } from '@/components/universe-card'
import { CreateUniverseModal } from '@/components/create-universe-modal'
import { ActionButton } from '@/components/ui/action-button'
import { LoadingPlaceholder } from '@/components/ui'
import { useState } from 'react'

export default function Home() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const { data: universes, isLoading: universesLoading } = useUniverses()
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPlaceholder title="Loading CanonCore..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">CanonCore</h1>
          <p className="text-lg text-gray-600">
            Content organisation platform for expanded universes
          </p>
          <ActionButton
            onClick={signInWithGoogle}
            variant="primary"
            size="lg"
          >
            Sign in with Google
          </ActionButton>
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
            <p className="text-gray-600 mt-2">
              Welcome back, {user.user_metadata?.full_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
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
              <div className={`w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium ${user.user_metadata?.avatar_url ? 'hidden' : ''}`}>
                {(user.user_metadata?.full_name || user.email || 'U')
                  .split(' ')
                  .map((word: string) => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="text-sm">
                <div className="font-medium">{user.user_metadata?.full_name || 'User'}</div>
                <div className="text-gray-500">{user.email}</div>
              </div>
              <ActionButton
                onClick={signOut}
                variant="danger"
                size="sm"
                className="ml-2"
              >
                Sign Out
              </ActionButton>
            </div>
            {universes && universes.length > 0 && (
              <ActionButton
                onClick={() => setShowCreateModal(true)}
                variant="primary"
              >
                Create Universe
              </ActionButton>
            )}
          </div>
        </div>

        {universesLoading ? (
          <LoadingPlaceholder 
            title="Loading universes..." 
            message="Please wait while we fetch your content universes"
          />
        ) : universes && universes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universes.map(universe => (
              <UniverseCard key={universe.id} universe={universe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 mb-4">
              You haven't created any universes yet
            </div>
            <ActionButton
              onClick={() => setShowCreateModal(true)}
              variant="primary"
            >
              Create Your First Universe
            </ActionButton>
          </div>
        )}

        {showCreateModal && (
          <CreateUniverseModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    </div>
  )
}
