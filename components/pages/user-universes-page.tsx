'use client'

import { UniverseCard, CreateUniverseModal } from '@/components/universe'
import { DeleteAccountModal } from '@/components/modals'
import { SidebarLayout } from '@/components/shared'
import { ActionButton, LoadingPlaceholder, VStack, Grid, HStack } from '@/components/ui'
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

  // Compact profile section component
  const CompactProfileSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <HStack spacing="md" align="center" justify="between">
        <HStack spacing="md" align="center">
          {/* User Avatar */}
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-lg ${user.user_metadata?.avatar_url ? 'hidden' : ''}`}>
            {getUserInitials(user)}
          </div>
          
          {/* User Info */}
          <VStack spacing="xs">
            <h1 className="text-xl font-bold text-gray-900">
              {user.user_metadata?.full_name || formatUsernameForDisplay(username)}
            </h1>
            <div className="text-sm text-gray-600">
              @{username} • {universes?.length || 0} universe{universes?.length !== 1 ? 's' : ''}
            </div>
          </VStack>
        </HStack>

        {/* Actions */}
        {isOwnProfile && (
          <ActionButton
            onClick={onShowCreateModal}
            variant="primary"
          >
            Create Universe
          </ActionButton>
        )}
      </HStack>
    </div>
  )

  return (
    <SidebarLayout
      title={isOwnProfile ? 'Dashboard' : `${formatUsernameForDisplay(username)}'s Profile`}
      icon={isOwnProfile ? '🏠' : '👤'}
      user={user}
      onSignOut={onSignOut}
      onDeleteAccount={onShowDeleteAccountModal}
      breadcrumbs={[
        { label: isOwnProfile ? 'Dashboard' : `${formatUsernameForDisplay(username)}'s Profile` }
      ]}
    >
      <VStack spacing="lg">
        {/* Compact Profile Section */}
        <CompactProfileSection />

        {/* Universe Content */}
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
              <div className="text-sm text-gray-500">
                Use the &quot;Create Universe&quot; button above to get started
              </div>
            )}
          </VStack>
        )}
      </VStack>

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
    </SidebarLayout>
  )
}