'use client'

import { ReactNode } from 'react'
import { PageHeader, VStack, HStack, Grid, GridItem } from '@/components/ui'

interface DetailPageLayoutProps {
  // Header content
  backButton?: ReactNode
  title: string
  subtitle?: string  
  icon?: string
  actionButtons?: ReactNode

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
  mainContent,
  detailsCard,
  descriptionCard,
  versionsCard,
  relationshipsCard,
  additionalCards = [],
  children,
}: DetailPageLayoutProps) {
  // Construct the title with icon if provided
  const headerTitle = icon ? `${icon} ${title}` : title
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={headerTitle}
        subtitle={subtitle}
        backButton={backButton}
        actions={actionButtons}
        variant="bordered"
        size="lg"
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Grid cols={{ base: 1, lg: 2 }} gap="lg">
          <GridItem>
            <VStack spacing="lg">
              {mainContent}
            </VStack>
          </GridItem>

          <GridItem>
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