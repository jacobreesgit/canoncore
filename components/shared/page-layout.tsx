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
  return (
    <SidebarLayout
      title={title}
      subtitle={subtitle}
      icon={icon}
      user={user}
      onSignOut={onSignOut}
      onDeleteAccount={onDeleteAccount}
      showDeleteAccount={showDeleteAccount}
      pageActions={pageActions}
      sidebarCards={variant === 'detail' ? sidebarCards : []}
    >
      {children}
    </SidebarLayout>
  )
}