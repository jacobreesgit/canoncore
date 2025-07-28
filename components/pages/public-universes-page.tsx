'use client'

import { useState } from 'react'
import { UniverseCard } from '@/components/universe'
import { SidebarLayout } from '@/components/shared'
import { LoadingWrapper, VStack, Grid, ActionButton, HStack } from '@/components/ui'
import { DeleteAccountModal } from '@/components/modals'
import type { Universe } from '@/types/database'
import Link from 'next/link'

interface PublicUniversesPageProps {
  // Data
  user: any
  universes: (Universe & { profiles: { full_name: string; username: string } | null; isOwn: boolean })[]
  
  // Loading states
  authLoading: boolean
  universesLoading: boolean
  
  // Actions
  onSignOut: () => void
}

export function PublicUniversesPage({
  user,
  universes,
  authLoading,
  universesLoading,
  onSignOut
}: PublicUniversesPageProps) {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
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

  const headerActions = undefined

  return (
    <>
      <SidebarLayout
        title="Public Universes"
        subtitle="Discover amazing content universes created by the community"
        icon="🌍"
        user={user}
        onSignOut={onSignOut}
        onDeleteAccount={() => setShowDeleteAccountModal(true)}
        pageActions={headerActions}
        isUserPage={false}
      >
      <LoadingWrapper 
        isLoading={universesLoading}
        fallback="placeholder"
        title="Loading public universes..."
        message="Please wait while we fetch community universes"
      >
        {universes && universes.length > 0 ? (
        <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
          {universes.map(universe => (
            <UniverseCard 
              key={universe.id} 
              universe={universe} 
              hidePublicPrivateBadge 
              showUserInfo={{
                user_id: universe.user_id,
                username: universe.username || 'unknown'
              }}
              showOwnBadge={universe.isOwn}
              fromPublic={true}
            />
          ))}
        </Grid>
      ) : (
        <VStack spacing="md" align="center" className="py-12">
          <div className="text-lg text-gray-600">
            No public universes found
          </div>
          <div className="text-sm text-gray-500">
            Be the first to create a public universe for others to discover!
          </div>
        </VStack>
      )}
      </LoadingWrapper>
      </SidebarLayout>

      {showDeleteAccountModal && user?.email && (
        <DeleteAccountModal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          userEmail={user.email}
        />
      )}
    </>
  )
}