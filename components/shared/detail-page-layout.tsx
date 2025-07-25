'use client'

import { ReactNode } from 'react'
import { VStack, Grid, GridItem, SectionHeader } from '@/components/ui'
import { UserSidebarCard } from './user-sidebar-card'

interface DetailPageLayoutProps {
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

  // Main content (left side - 2/3 width)
  mainContent: ReactNode

  // Sidebar cards (right side - 1/3 width)
  sidebarCards?: ReactNode[]

  // Modals and other content
  children?: ReactNode
}

export function DetailPageLayout({
  title,
  subtitle,
  icon,
  user,
  onSignOut,
  onDeleteAccount,
  showDeleteAccount = false,
  pageActions,
  mainContent,
  sidebarCards = [],
  children,
}: DetailPageLayoutProps) {
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
        <Grid cols={{ base: 1, lg: 3 }} gap="lg">
          <GridItem className="lg:col-span-2">
            <VStack spacing="lg">
              {mainContent}
            </VStack>
          </GridItem>

          <GridItem className="lg:col-span-1">
            <VStack spacing="lg">
              <UserSidebarCard
                user={user}
                onSignOut={onSignOut}
                onDeleteAccount={onDeleteAccount}
                showDeleteAccount={showDeleteAccount}
                pageActions={pageActions}
              />
              {sidebarCards.map((card, index) => (
                <div key={index}>{card}</div>
              ))}
            </VStack>
          </GridItem>
        </Grid>
      </div>

      {children}
    </div>
  )
}