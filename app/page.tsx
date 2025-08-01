'use client'

import { useAuth } from '@/contexts/auth-context'
import { LoadingWrapper, ActionButton, VStack, Card, Grid, SectionHeader, PageHeader } from '@/components/ui'
import { SidebarLayout } from '@/components/shared'
import { getCurrentUsername } from '@/lib/username-utils'
import { useState } from 'react'
import { DeleteAccountModal } from '@/components/modals'
import Link from 'next/link'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Loading CanonCore..."
        >
          <div />
        </LoadingWrapper>
      </div>
    )
  }

  const headerActions = undefined

  const handleSignOut = () => {
    signOut()
  }

  return (
    <>
      <SidebarLayout
          title=""
          subtitle=""
          user={user}
          onSignOut={handleSignOut}
          onDeleteAccount={() => setShowDeleteAccountModal(true)}
          pageActions={headerActions}
          isUserPage={false}
        >
          <div className="max-w-5xl mx-auto">
            <VStack spacing="2xl">

              {/* Hero Section */}
              <div className="text-center max-w-4xl mx-auto">
                <VStack spacing="lg">
                  <div className="mb-4">
                    <div className="text-center mb-6">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Organise Your
                        <span className="text-blue-600"> Expanded Universe</span>
                      </h1>
                      <p className="text-xl text-gray-600">
                        From simple stories to sprawling universes with hundreds of characters. 
                        <span className="font-medium text-gray-700"> Build, connect, and manage your fictional worlds with professional-grade tools.</span>
                      </p>
                    </div>
                  </div>

                  {!user && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <Link href="/auth/signin">
                        <ActionButton size="lg" variant="primary" className="px-6 py-2 text-md">
                          Start Creating
                        </ActionButton>
                      </Link>
                      <Link href="/public-universes">
                        <ActionButton size="lg" variant="secondary" className="px-6 py-2 text-md">
                          Explore Examples
                        </ActionButton>
                      </Link>
                    </div>
                  )}

                </VStack>
              </div>

              {/* Features Grid */}
              <div className="w-full">
                <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="lg">
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <VStack spacing="md">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🌳</span>
                      </div>
                      <div>
                        <SectionHeader title="Unlimited Hierarchy" level={3} />
                        <p className="text-gray-600">Build nested content trees with infinite depth. Organise by eras, series, seasons, or any structure that fits your universe.</p>
                      </div>
                    </VStack>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <VStack spacing="md">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🔗</span>
                      </div>
                      <div>
                        <SectionHeader title="Smart Relationships" level={3} />
                        <p className="text-gray-600">Link related content across your universe. Track sequels, spin-offs, character appearances, and complex story connections.</p>
                      </div>
                    </VStack>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <VStack spacing="md">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📚</span>
                      </div>
                      <div>
                        <SectionHeader title="Version Management" level={3} />
                        <p className="text-gray-600">Track different cuts, editions, and timeline variations. Perfect for managing director&apos;s cuts, extended versions, and alternate timelines.</p>
                      </div>
                    </VStack>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <VStack spacing="md">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div>
                        <SectionHeader title="Custom Organisation" level={3} />
                        <p className="text-gray-600">Define your own content types with custom emojis. Movies, books, games, characters - organise exactly how you think.</p>
                      </div>
                    </VStack>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <VStack spacing="md">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🌍</span>
                      </div>
                      <div>
                        <SectionHeader title="Public Sharing" level={3} />
                        <p className="text-gray-600">Share your universes with the community. Let others explore your creations and discover new fictional worlds to enjoy.</p>
                      </div>
                    </VStack>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <VStack spacing="md">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <div>
                        <SectionHeader title="Lightning Fast" level={3} />
                        <p className="text-gray-600">Built for speed and scale. Handle thousands of content items with instant search, drag-and-drop organisation, and bulk operations.</p>
                      </div>
                    </VStack>
                  </Card>
                </Grid>
              </div>

            </VStack>
          </div>
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
