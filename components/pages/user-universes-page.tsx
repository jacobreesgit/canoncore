'use client'

import { UniverseCard, CreateUniverseModal } from '@/components/universe'
import { DeleteAccountModal } from '@/components/modals'
import { ActionButton, LoadingPlaceholder, PageHeader, VStack, HStack, Grid } from '@/components/ui'
import Link from 'next/link'
import { formatUsernameForDisplay } from '@/lib/username'
import { getUserInitials } from '@/lib/page-utils'
import type { Universe } from '@/types/database'

interface UserUniversesPageProps {
  // Data
  user: any
  universes: Universe[] | undefined
  username: string
  isOwnProfile: boolean
  
  // Loading states
  authLoading: boolean
  universesLoading: boolean
  
  // Actions
  onSignOut: () => void
  onShowCreateModal: () => void
  onShowDeleteAccountModal: () => void
  
  // Modal states
  showCreateModal: boolean
  showDeleteAccountModal: boolean
  onCloseCreateModal: () => void
  onCloseDeleteAccountModal: () => void
}

export function UserUniversesPage({
  user,
  universes,
  username,
  isOwnProfile,
  authLoading,
  universesLoading,
  onSignOut,
  onShowCreateModal,
  onShowDeleteAccountModal,
  showCreateModal,
  showDeleteAccountModal,
  onCloseCreateModal,
  onCloseDeleteAccountModal
}: UserUniversesPageProps) {
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPlaceholder title="Loading..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <VStack spacing="lg" align="center" className="text-center">
          <h1 className="text-4xl font-bold">CanonCore</h1>
          <p className="text-lg text-gray-600">
            Sign in to view {formatUsernameForDisplay(username)}&apos;s universes
          </p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
          >
            Go Home
          </Link>
        </VStack>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={isOwnProfile ? 'Your Universes' : `${formatUsernameForDisplay(username)}'s Universes`}
        subtitle={
          isOwnProfile ? 
            `Welcome back, ${user.user_metadata?.full_name || user.email}` :
            `Explore ${formatUsernameForDisplay(username)}'s content universes`
        }
        actions={
          <HStack spacing="md">
            <HStack spacing="sm" align="center" className="px-4 py-2 bg-gray-100 rounded-lg">
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
                {getUserInitials(user)}
              </div>
              <div className="text-sm">
                <div className="font-medium">{user.user_metadata?.full_name || 'User'}</div>
                <div className="text-gray-500">{user.email}</div>
              </div>
              <HStack spacing="xs" className="ml-2">
                <ActionButton
                  onClick={onSignOut}
                  variant="secondary"
                  size="sm"
                >
                  Sign Out
                </ActionButton>
                {isOwnProfile && (
                  <ActionButton
                    onClick={onShowDeleteAccountModal}
                    variant="danger"
                    size="sm"
                  >
                    Delete Account
                  </ActionButton>
                )}
              </HStack>
            </HStack>
            {isOwnProfile && universes && universes.length > 0 && (
              <ActionButton
                onClick={onShowCreateModal}
                variant="primary"
              >
                Create Universe
              </ActionButton>
            )}
          </HStack>
        }
      />

      <div className="max-w-6xl mx-auto p-8">
        {universesLoading ? (
          <LoadingPlaceholder 
            title="Loading universes..." 
            message="Please wait while we fetch the content universes"
          />
        ) : universes && universes.length > 0 ? (
          <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
            {universes
              .filter(universe => isOwnProfile || universe.username === username)
              .map(universe => (
                <UniverseCard key={universe.id} universe={universe} />
              ))}
          </Grid>
        ) : (
          <VStack spacing="md" align="center" className="py-12">
            <div className="text-lg text-gray-600">
              {isOwnProfile 
                ? "You haven't created any universes yet"
                : `${formatUsernameForDisplay(username)} hasn't created any universes yet`
              }
            </div>
            {isOwnProfile && (
              <ActionButton
                onClick={onShowCreateModal}
                variant="primary"
              >
                Create Your First Universe
              </ActionButton>
            )}
          </VStack>
        )}

        {showCreateModal && isOwnProfile && (
          <CreateUniverseModal onClose={onCloseCreateModal} />
        )}

        {showDeleteAccountModal && isOwnProfile && user?.email && (
          <DeleteAccountModal
            isOpen={showDeleteAccountModal}
            onClose={onCloseDeleteAccountModal}
            userEmail={user.email}
          />
        )}
      </div>
    </div>
  )
}