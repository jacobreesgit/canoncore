'use client'

import { useState } from 'react'
import { UniverseCard, CreateUniverseModal } from '@/components/universe'
import { DeleteAccountModal } from '@/components/modals'
import { SidebarLayout } from '@/components/shared'
import { ActionButton, LoadingPlaceholder, VStack, Grid, HStack, SectionHeader } from '@/components/ui'
import { useListManagement } from '@/hooks/use-list-management'
import { useUpdateUniverse, useDeleteUniverse } from '@/hooks/use-universes'
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
  const updateUniverse = useUpdateUniverse()
  const deleteUniverse = useDeleteUniverse()

  // Transform universes to match ListManagementItem interface
  const managementItems = (universes || [])
    .filter(universe => isOwnProfile || universe.username === username)
    .map(universe => ({
      ...universe,
      title: universe.name, // Map name to title for list management
      parent_id: null,
      order_index: 0, // Universes don't have ordering
    }))

  // List management for selection
  const listManagement = useListManagement({
    items: managementItems,
    enableSelection: isOwnProfile, // Only enable selection for own profile
    onBulkDelete: async (selectedItems) => {
      for (const item of selectedItems) {
        await deleteUniverse.mutateAsync(item.id)
      }
    },
  })
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

  // Get display name for user
  const userDisplayName = user?.user_metadata?.full_name || formatUsernameForDisplay(username)

  return (
    <SidebarLayout
      title={userDisplayName}
      subtitle={`@${username} • ${universes?.length || 0} universe${universes?.length !== 1 ? 's' : ''}`}
      user={user}
      onSignOut={onSignOut}
      onDeleteAccount={onShowDeleteAccountModal}
      isUserPage={true}
      pageActions={
        isOwnProfile ? (
          <ActionButton
            onClick={onShowCreateModal}
            variant="primary"
          >
            Create Universe
          </ActionButton>
        ) : undefined
      }
    >
      {/* Universe Content */}
      {universesLoading ? (
          <LoadingPlaceholder 
            title="Loading universes..." 
            message="Please wait while we fetch the content universes"
          />
        ) : universes && universes.length > 0 ? (
          <VStack spacing="lg">
            {/* Selection Controls - only show for own profile */}
            {isOwnProfile && listManagement.selectionActions && (
              <SectionHeader 
                title={`Universes (${managementItems.length})`}
                level={2}
                actions={
                  <HStack spacing="sm">
                    {!listManagement.selection?.isSelectionMode ? (
                      <ActionButton
                        onClick={listManagement.selectionActions.enterSelectionMode}
                        variant="primary"
                        size="sm"
                      >
                        Select
                      </ActionButton>
                    ) : (
                      <>
                        <ActionButton
                          onClick={listManagement.selectionActions.selectAll}
                          variant="primary"
                          size="sm"
                        >
                          Select All
                        </ActionButton>
                        <ActionButton
                          onClick={listManagement.selectionActions.clearSelection}
                          variant="info"
                          size="sm"
                        >
                          Clear All
                        </ActionButton>
                        {listManagement.selection?.hasSelection && (
                          <ActionButton
                            onClick={listManagement.selectionActions.bulkDelete}
                            variant="danger"
                            size="sm"
                          >
                            Delete Selected ({listManagement.selection.selectedCount})
                          </ActionButton>
                        )}
                        <ActionButton
                          onClick={listManagement.selectionActions.exitSelectionMode}
                          variant="info"
                          size="sm"
                        >
                          Cancel Selection
                        </ActionButton>
                      </>
                    )}
                  </HStack>
                }
              />
            )}
            
            <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
              {managementItems.map(universe => (
                <UniverseCard 
                  key={universe.id} 
                  universe={universe}
                  selection={isOwnProfile && listManagement.selection ? {
                    selectedItems: listManagement.selection.selectedItems,
                    isSelectionMode: listManagement.selection.isSelectionMode,
                    toggleSelection: listManagement.selectionActions!.toggleSelection,
                  } : undefined}
                />
              ))}
            </Grid>
          </VStack>
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