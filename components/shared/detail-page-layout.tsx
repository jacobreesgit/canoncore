'use client'

import { ReactNode } from 'react'
import { VStack, Grid, GridItem } from '@/components/ui'
import { AppHeader } from './app-header'

interface DetailPageLayoutProps {
  // Header content
  backButton?: ReactNode
  title: string
  subtitle?: string  
  icon?: string
  actionButtons?: ReactNode
  
  // User profile for header
  user?: any
  onSignOut?: () => void

  // Main content (left side - 2/3 width)
  mainContent: ReactNode

  // Sidebar cards (right side - 1/3 width)
  detailsCard?: ReactNode
  descriptionCard?: ReactNode
  versionsCard?: ReactNode
  relationshipsCard?: ReactNode
  additionalCards?: ReactNode[]

  // Modals and other content
  children?: ReactNode
}

export function DetailPageLayout({
  backButton,
  title,
  subtitle,
  icon,
  actionButtons,
  user,
  onSignOut,
  mainContent,
  detailsCard,
  descriptionCard,
  versionsCard,
  relationshipsCard,
  additionalCards = [],
  children,
}: DetailPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        backButton={backButton}
        user={user}
        onSignOut={onSignOut}
        pageActions={actionButtons}
        variant="bordered"
        size="lg"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Grid cols={{ base: 1, lg: 3 }} gap="lg">
          <GridItem className="lg:col-span-2">
            <VStack spacing="lg">
              {mainContent}
            </VStack>
          </GridItem>

          <GridItem className="lg:col-span-1">
            <VStack spacing="lg">
              {detailsCard}
              {descriptionCard}
              {versionsCard}
              {relationshipsCard}
              {additionalCards.map((card, index) => (
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