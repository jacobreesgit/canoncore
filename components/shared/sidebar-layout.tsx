'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { VStack, Grid, GridItem, ResponsiveHeader, MobileLayout, HeaderTitle, Card } from '@/components/ui'
import { useIsDesktop } from '@/hooks/use-media-query'
import { NavigationMenu } from './navigation-menu'

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
      <div className="w-80 p-4 flex flex-col h-screen">
        {/* Navigation Card */}
        <Card className="flex flex-col flex-1 !p-0">
          {/* Logo - Inside card */}
          <div className="px-6 py-5 border-b border-gray-200">
            <Link href="/" className="block">
              <HeaderTitle level={1}>CanonCore</HeaderTitle>
              <p className="text-sm text-gray-600 mt-1">Content Organisation</p>
            </Link>
          </div>
          
          <div className="flex-1 px-6 py-5 overflow-y-auto">
            <NavigationMenu 
              user={currentUser || user}
              onSignOut={onSignOut}
            />
          </div>
        </Card>
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