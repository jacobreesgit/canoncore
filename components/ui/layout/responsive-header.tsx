'use client'

import { useState } from 'react'
import { ReactNode } from 'react'
import Link from 'next/link'
import { HStack, SectionHeader, ActionButton, IconButton, MenuIcon, CloseIcon, UserAvatar, Breadcrumbs } from '@/components/ui'
import { UserProfile } from '@/components/shared'

interface ResponsiveHeaderProps {
  // Page title
  title: string
  subtitle?: string  
  icon?: string

  // User info
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void

  // Primary action
  pageActions?: ReactNode


  // Breadcrumbs
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function ResponsiveHeader({
  title,
  subtitle,
  icon,
  user,
  onSignOut,
  onDeleteAccount,
  pageActions,
  breadcrumbs = [],
}: ResponsiveHeaderProps) {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <HStack justify="between" align="center">
          {/* Left: Hamburger + Logo */}
          <HStack spacing="md" align="center">
            <IconButton
              onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              aria-label="Open menu"
              size="md"
            >
              <MenuIcon />
            </IconButton>
            <Link href="/" className="text-xl font-bold text-gray-900">
              CanonCore
            </Link>
          </HStack>

          {/* Right: Primary Action */}
          {pageActions && (
            <div className="flex-shrink-0">
              {pageActions}
            </div>
          )}
        </HStack>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="mt-2">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="mb-8">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="mb-4">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
          <SectionHeader 
            title={icon ? `${icon} ${title}` : title}
            subtitle={subtitle}
            level={1}
            actions={pageActions}
          />
        </div>
      </div>

      {/* Hamburger Menu Overlay */}
      {showHamburgerMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-55"
            onClick={() => setShowHamburgerMenu(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <HStack justify="between" align="center">
                <h2 className="text-lg font-semibold">Menu</h2>
                <IconButton
                  onClick={() => setShowHamburgerMenu(false)}
                  aria-label="Close menu"
                  size="md"
                >
                  <CloseIcon />
                </IconButton>
              </HStack>
            </div>
            
            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-200">
              <UserProfile
                user={user}
                onSignOut={() => {
                  onSignOut()
                  setShowHamburgerMenu(false)
                }}
                onDeleteAccount={onDeleteAccount ? () => {
                  onDeleteAccount()
                  setShowHamburgerMenu(false)
                } : undefined}
                variant="card"
                size="md"
              />
            </div>

          </div>
        </div>
      )}

    </>
  )
}