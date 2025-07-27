'use client'

import { UniverseCard } from '@/components/universe'
import { SidebarLayout } from '@/components/shared'
import { LoadingPlaceholder, VStack, Grid } from '@/components/ui'
import type { Universe } from '@/types/database'

interface PublicUniversesPageProps {
  // Data
  user: any
  universes: (Universe & { profiles: { full_name: string } | null })[]
  
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
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPlaceholder title="Loading..." />
      </div>
    )
  }

  if (!user) {
    return null // Will be handled by redirect in client
  }

  return (
    <SidebarLayout
      title="Browse Public"
      subtitle="Discover amazing content universes created by the community"
      icon="🌍"
      user={user}
      onSignOut={onSignOut}
      breadcrumbs={[
        { label: "Browse Public" }
      ]}
    >
      {universesLoading ? (
        <LoadingPlaceholder 
          title="Loading public universes..." 
          message="Please wait while we fetch community universes"
        />
      ) : universes && universes.length > 0 ? (
        <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
          {universes.map(universe => (
            <div key={universe.id} className="relative">
              <UniverseCard universe={universe} />
              {universe.profiles?.full_name && (
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
                  by {universe.profiles.full_name}
                </div>
              )}
              {universe.source_description && (
                <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                  {universe.source_description}
                </div>
              )}
            </div>
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
    </SidebarLayout>
  )
}