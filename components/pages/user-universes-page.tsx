'use client'

import { useState, useMemo, useCallback } from 'react'
import { UniverseCard, CreateUniverseModal } from '@/components/universe'
import { DeleteAccountModal } from '@/components/modals'
import { SidebarLayout } from '@/components/shared'
import { ActionButton, LoadingWrapper, VStack, Grid, HStack, SectionHeader, Select } from '@/components/ui'
import { AuthForm } from '@/components/auth'
import { useListManagement } from '@/hooks/use-list-management'
import { useUpdateUniverse, useDeleteUniverse } from '@/hooks/use-universes'
import { useProfile, useAvatarUrl } from '@/hooks/use-profile'
import { EditProfileModal } from '@/components/profile'
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
  
  // Profile data and edit modal state
  const { data: profile } = useProfile()
  const avatarUrl = useAvatarUrl(user, profile)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Transform and sort universes to match ListManagementItem interface - ensure stable array
  const managementItems = useMemo(() => {
    if (!universes) return []
    const filtered = universes
      .filter(universe => isOwnProfile || universe.username === username)
      .map(universe => ({
        ...universe,
        title: universe.name, // Map name to title for list management
        parent_id: null,
        order_index: 0, // Universes don't have ordering
      }))
    
    // Sort the filtered universes
    return filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [universes, isOwnProfile, username, sortBy, sortOrder])

  // Stable callback for bulk delete
  const handleBulkDelete = useCallback(async (selectedItems: any[]) => {
    for (const item of selectedItems) {
      await deleteUniverse.mutateAsync(item.id)
    }
  }, [deleteUniverse])

  // List management for selection
  const listManagement = useListManagement({
    items: managementItems,
    enableSelection: isOwnProfile, // Only enable selection for own profile
    viewMode: 'card', // Default to card view for universes
    showViewToggle: false,
    onBulkDelete: handleBulkDelete,
  })
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Loading..."
        >
          <div />
        </LoadingWrapper>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <img
                  src="/globe.png"
                  alt="CanonCore"
                  className="w-10 h-10"
                />
                <h1 className="text-2xl font-bold text-gray-900">CanonCore</h1>
              </Link>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex items-center justify-center py-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-8 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
              <p className="text-gray-600">
                Sign in to view @{username}&apos;s universes
              </p>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    )
  }

  // Get display name for user
  const userDisplayName = profile?.full_name || user?.user_metadata?.full_name || formatUsernameForDisplay(username)

  return (
    <SidebarLayout
      title={`${userDisplayName}'s Universes`}
      subtitle={`@${username}`}
      user={user}
      onSignOut={onSignOut}
      onDeleteAccount={onShowDeleteAccountModal}
      isUserPage={true}
      pageActions={
        isOwnProfile ? (
          <HStack spacing="sm">
            <ActionButton
              onClick={() => setShowEditProfileModal(true)}
              variant="secondary"
              disabled={authLoading}
            >
              Edit Profile
            </ActionButton>
            <ActionButton
              onClick={onShowCreateModal}
              variant="primary"
              disabled={authLoading || universesLoading}
            >
              Create Universe
            </ActionButton>
          </HStack>
        ) : undefined
      }
    >
      {/* Universe Content */}
      <LoadingWrapper 
        isLoading={universesLoading}
        fallback="placeholder"
        title="Loading universes..."
        message="Please wait while we fetch the content universes"
      >
        {universes && universes.length > 0 ? (
          <VStack spacing="lg">
            {/* Controls - sorting and selection */}
            <SectionHeader 
              title={`Universes (${managementItems.length})`}
              level={2}
              actions={
                <HStack spacing="sm" align="center">
                  {/* Sort Controls */}
                  <Select
                    value={sortBy}
                    onChange={(value) => setSortBy(value as 'name' | 'created' | 'updated')}
                    options={[
                      { value: 'created', label: 'Sort by Created' },
                      { value: 'updated', label: 'Sort by Updated' },
                      { value: 'name', label: 'Sort by Name' }
                    ]}
                    size="sm"
                  />
                  <Select
                    value={sortOrder}
                    onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                    options={[
                      { value: 'desc', label: 'Newest First' },
                      { value: 'asc', label: 'Oldest First' }
                    ]}
                    size="sm"
                  />
                  
                  {/* Selection Controls - only show for own profile */}
                  {isOwnProfile && listManagement.selectionActions && (
                    <>
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
                    </>
                  )}
                </HStack>
              }
            />
            
            {/* Universe Display - card layout only */}
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
      </LoadingWrapper>

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

      {showEditProfileModal && isOwnProfile && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          user={user}
        />
      )}
    </SidebarLayout>
  )
}