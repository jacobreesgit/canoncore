'use client'

import { ReactNode } from 'react'
import { SidebarLayout } from './sidebar-layout'

interface UniverseLayoutProps {
  // Page title
  title: string
  subtitle?: string  
  icon?: string

  // Universe owner (for sidebar display)
  universeOwner: {
    email?: string
    user_metadata?: {
      full_name?: string | null
      username?: string | null
      avatar_url?: string | null
    }
  }
  
  // Current user (for auth actions)
  currentUser: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  showDeleteAccount?: boolean
  pageActions?: ReactNode

  // Page type
  isUserPage?: boolean

  // Main content (left side - 2/3 width)
  mainContent: ReactNode

  // Sidebar cards (right side - 1/3 width)
  sidebarCards?: ReactNode[]

  // Breadcrumbs
  breadcrumbs?: Array<{ label: string; href?: string }>

  // Modals and other content
  children?: ReactNode
}

export function UniverseLayout({
  title,
  subtitle,
  icon,
  universeOwner,
  currentUser,
  onSignOut,
  onDeleteAccount,
  showDeleteAccount = false,
  pageActions,
  isUserPage = false,
  mainContent,
  sidebarCards = [],
  breadcrumbs,
  children,
}: UniverseLayoutProps) {
  return (
    <SidebarLayout
      title={title}
      subtitle={subtitle}
      icon={icon}
      user={universeOwner}  // Display universe owner in page header
      currentUser={currentUser}  // Use current user for navigation
      onSignOut={onSignOut}  // But use current user's auth actions
      onDeleteAccount={onDeleteAccount}
      pageActions={pageActions}
      isUserPage={isUserPage}
      sidebarCards={sidebarCards}
      breadcrumbs={breadcrumbs}
    >
      {mainContent}
      {children}
    </SidebarLayout>
  )
}