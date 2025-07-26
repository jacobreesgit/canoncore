'use client'

import { ReactNode } from 'react'
import { SidebarLayout } from './sidebar-layout'

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

  // Mobile navigation data
  universes?: Array<{ id: string; name: string; slug: string; username: string }>
  currentUniverseId?: string
  onUniverseSwitch?: (universeId: string) => void
  onCreateUniverse?: () => void
  breadcrumbs?: Array<{ label: string; href?: string }>
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
  universes,
  currentUniverseId,
  onUniverseSwitch,
  onCreateUniverse,
  breadcrumbs,
}: DetailPageLayoutProps) {
  return (
    <SidebarLayout
      title={title}
      subtitle={subtitle}
      icon={icon}
      user={user}
      onSignOut={onSignOut}
      onDeleteAccount={onDeleteAccount}
      pageActions={pageActions}
      sidebarCards={sidebarCards}
      universes={universes}
      currentUniverseId={currentUniverseId}
      onUniverseSwitch={onUniverseSwitch}
      onCreateUniverse={onCreateUniverse}
      breadcrumbs={breadcrumbs}
    >
      {mainContent}
      {children}
    </SidebarLayout>
  )
}