'use client'

import { ReactNode } from 'react'
import { VStack, Grid, GridItem, SectionHeader } from '@/components/ui'
import { UserSidebarCard } from './user-sidebar-card'

interface PageLayoutProps {
  // Page title
  title: string
  subtitle?: string  
  icon?: string

  // User sidebar
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  showDeleteAccount?: boolean
  pageActions?: ReactNode

  // Layout type
  variant?: 'detail' | 'grid'

  // Main content
  children: ReactNode

  // Sidebar cards (only for detail variant)
  sidebarCards?: ReactNode[]
}

export function PageLayout({
  title,
  subtitle,
  icon,
  user,
  onSignOut,
  onDeleteAccount,
  showDeleteAccount = false,
  pageActions,
  variant = 'detail',
  children,
  sidebarCards = [],
}: PageLayoutProps) {
  const userSidebar = (
    <UserSidebarCard
      user={user}
      onSignOut={onSignOut}
      onDeleteAccount={onDeleteAccount}
      showDeleteAccount={showDeleteAccount}
      pageActions={pageActions}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <SectionHeader 
            title={icon ? `${icon} ${title}` : title}
            subtitle={subtitle}
            level={1}
          />
        </div>

        {variant === 'grid' ? (
          <Grid cols={{ base: 1, lg: 4 }} gap="lg">
            <GridItem className="lg:col-span-3">
              {children}
            </GridItem>
            <GridItem className="lg:col-span-1">
              <VStack spacing="lg">
                {userSidebar}
              </VStack>
            </GridItem>
          </Grid>
        ) : (
          <Grid cols={{ base: 1, lg: 3 }} gap="lg">
            <GridItem className="lg:col-span-2">
              <VStack spacing="lg">
                {children}
              </VStack>
            </GridItem>
            <GridItem className="lg:col-span-1">
              <VStack spacing="lg">
                {userSidebar}
                {sidebarCards.map((card, index) => (
                  <div key={index}>{card}</div>
                ))}
              </VStack>
            </GridItem>
          </Grid>
        )}
      </div>
    </div>
  )
}