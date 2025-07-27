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

  // Page type
  isUserPage?: boolean

  // Main content (left side - 2/3 width)
  mainContent: ReactNode

  // Sidebar cards (right side - 1/3 width)
  sidebarCards?: ReactNode[]

  // Modals and other content
  children?: ReactNode

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
  isUserPage = false,
  mainContent,
  sidebarCards = [],
  children,
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
      isUserPage={isUserPage}
      sidebarCards={sidebarCards}
      breadcrumbs={breadcrumbs}
    >
      {mainContent}
      {children}
    </SidebarLayout>
  )
}