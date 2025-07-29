'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { VStack, Grid, GridItem, ResponsiveHeader, MobileLayout, Header } from '@/components/ui'
import { NavigationSidebar } from './navigation-sidebar'
import { useIsDesktop } from '@/hooks/use-media-query'

interface SidebarLayoutProps {
  // Page title
  title: string
  subtitle?: string  
  icon?: string

  // User context (for navigation)
  user: any
  currentUser?: any // Optional override for navigation (when different from display user)
  onSignOut: () => void
  onDeleteAccount?: () => void
  onEditProfile?: () => void
  pageActions?: ReactNode

  // Page type
  isUserPage?: boolean

  // Main content area
  children: ReactNode

  // Right sidebar cards (optional)
  sidebarCards?: ReactNode[]

  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function SidebarLayout({
  title,
  subtitle,
  icon,
  user,
  currentUser,
  onSignOut,
  onDeleteAccount,
  onEditProfile,
  pageActions,
  isUserPage = false,
  children,
  sidebarCards = [],
  breadcrumbs,
}: SidebarLayoutProps) {
  const isDesktop = useIsDesktop()

  // Mobile Layout
  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ResponsiveHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          user={user}
          onSignOut={onSignOut}
          onDeleteAccount={onDeleteAccount}
          onEditProfile={onEditProfile}
          pageActions={pageActions}
          isUserPage={isUserPage}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="px-4 py-6">
          <MobileLayout sidebarCards={sidebarCards} key={`mobile-${sidebarCards.length}`}>
            {children}
          </MobileLayout>
        </div>
      </div>
    )
  }

  // Desktop Layout (existing)
  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Sidebar - Floating */}
      <div className="w-72 p-4 flex flex-col h-screen">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <Link href="/" className="block">
              <Header size="md">
                <div>
                  <div className="text-2xl font-bold text-gray-900">CanonCore</div>
                  <p className="text-sm text-gray-600 mt-1">Content Organisation</p>
                </div>
              </Header>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <NavigationSidebar 
              currentUsername={(currentUser || user)?.username} 
              user={currentUser || user}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <ResponsiveHeader
            title={title}
            subtitle={subtitle}
            icon={icon}
            user={user}
            onSignOut={onSignOut}
            onDeleteAccount={onDeleteAccount}
            onEditProfile={onEditProfile}
            pageActions={pageActions}
            isUserPage={isUserPage}
            breadcrumbs={breadcrumbs}
          />

          {sidebarCards.length > 0 ? (
            // 2:1 ratio layout with right sidebar cards
            <Grid cols={{ base: 1, lg: 3 }} gap="lg" key="sidebar-layout">
              <GridItem className="lg:col-span-2">
                <VStack spacing="lg">
                  {children}
                </VStack>
              </GridItem>
              <GridItem className="lg:col-span-1">
                <VStack spacing="lg">
                  {sidebarCards.map((card, index) => (
                    <div key={index}>{card}</div>
                  ))}
                </VStack>
              </GridItem>
            </Grid>
          ) : (
            // Full width layout when no right sidebar cards
            <div className="w-full" key="full-width-layout">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}