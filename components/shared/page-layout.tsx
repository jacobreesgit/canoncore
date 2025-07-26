'use client'

import { ReactNode } from 'react'
import { SidebarLayout } from './sidebar-layout'

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

  // Mobile navigation data
  universes?: Array<{ id: string; name: string; slug: string; username: string }>
  currentUniverseId?: string
  onUniverseSwitch?: (universeId: string) => void
  onCreateUniverse?: () => void
  breadcrumbs?: Array<{ label: string; href?: string }>
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
  universes,
  currentUniverseId,
  onUniverseSwitch,
  onCreateUniverse,
  breadcrumbs,
}: PageLayoutProps) {
  return (
    <SidebarLayout
      title={title}
      subtitle={subtitle}
      icon={icon}
      user={user}
      onSignOut={onSignOut}
      onDeleteAccount={onDeleteAccount}
      pageActions={pageActions}
      sidebarCards={variant === 'detail' ? sidebarCards : []}
      universes={universes}
      currentUniverseId={currentUniverseId}
      onUniverseSwitch={onUniverseSwitch}
      onCreateUniverse={onCreateUniverse}
      breadcrumbs={breadcrumbs}
    >
      {children}
    </SidebarLayout>
  )
}