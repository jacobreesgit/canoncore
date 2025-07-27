'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { VStack, Grid, GridItem, ResponsiveHeader, MobileLayout } from '@/components/ui'
import { NavigationSidebar } from './navigation-sidebar'
import { useIsDesktop } from '@/hooks/use-media-query'

interface SidebarLayoutProps {
  // Page title
  title: string
  subtitle?: string  
  icon?: string

  // User context (for navigation)
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  pageActions?: ReactNode

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
  onSignOut,
  onDeleteAccount,
  pageActions,
  children,
  sidebarCards = [],
  breadcrumbs,
}: SidebarLayoutProps) {
  const isDesktop = useIsDesktop()

  // Mobile Layout
  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ResponsiveHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          user={user}
          onSignOut={onSignOut}
          onDeleteAccount={onDeleteAccount}
          pageActions={pageActions}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="px-4 py-6">
          <MobileLayout sidebarCards={sidebarCards}>
            {children}
          </MobileLayout>
        </div>
      </div>
    )
  }

  // Desktop Layout (existing)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="block">
            <h1 className="text-2xl font-bold text-gray-900">CanonCore</h1>
            <p className="text-sm text-gray-600 mt-1">Content Organisation</p>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <NavigationSidebar currentUsername={user?.username} user={user} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ResponsiveHeader
            title={title}
            subtitle={subtitle}
            icon={icon}
            user={user}
            onSignOut={onSignOut}
            onDeleteAccount={onDeleteAccount}
            pageActions={pageActions}
            breadcrumbs={breadcrumbs}
          />

          {sidebarCards.length > 0 ? (
            // 2:1 ratio layout with right sidebar cards
            <Grid cols={{ base: 1, lg: 3 }} gap="lg">
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
            <div className="w-full">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}