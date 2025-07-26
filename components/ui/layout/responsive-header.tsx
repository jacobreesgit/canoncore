'use client'

import { useState } from 'react'
import { ReactNode } from 'react'
import Link from 'next/link'
import { HStack, SectionHeader, ActionButton } from '@/components/ui'

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

  // Mobile navigation
  universes?: Array<{ id: string; name: string; slug: string; username: string }>
  currentUniverseId?: string
  onUniverseSwitch?: (universeId: string) => void
  onCreateUniverse?: () => void

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
  universes = [],
  currentUniverseId,
  onUniverseSwitch,
  onCreateUniverse,
  breadcrumbs = [],
}: ResponsiveHeaderProps) {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <HStack justify="between" align="center">
          {/* Left: Hamburger + Logo */}
          <HStack spacing="md" align="center">
            <button
              onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="text-xl font-bold text-gray-900">
              CanonCore
            </Link>
          </HStack>

          {/* Right: Avatar + Primary Action */}
          <HStack spacing="sm" align="center">
            {pageActions && (
              <div className="flex-shrink-0">
                {pageActions}
              </div>
            )}
            <button
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium text-sm hover:bg-blue-600 transition-colors"
              aria-label="User menu"
            >
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </button>
          </HStack>
        </HStack>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-gray-900">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="mx-2">{'>'}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="mb-8">
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowHamburgerMenu(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <HStack justify="between" align="center">
                <h2 className="text-lg font-semibold">Universes</h2>
                <button
                  onClick={() => setShowHamburgerMenu(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </HStack>
            </div>
            
            <div className="p-4 space-y-4">
              {onCreateUniverse && (
                <ActionButton
                  onClick={() => {
                    onCreateUniverse()
                    setShowHamburgerMenu(false)
                  }}
                  variant="primary"
                  fullWidth
                >
                  Create Universe
                </ActionButton>
              )}
              
              <div className="space-y-2">
                {universes.map((universe) => (
                  <button
                    key={universe.id}
                    onClick={() => {
                      onUniverseSwitch?.(universe.id)
                      setShowHamburgerMenu(false)
                    }}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      universe.id === currentUniverseId
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{universe.name}</div>
                    <div className="text-sm text-gray-500">/{universe.username}/{universe.slug}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Menu Dropdown */}
      {showAvatarMenu && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0"
            onClick={() => setShowAvatarMenu(false)}
          />
          <div className="absolute top-16 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="font-medium">{user?.user_metadata?.full_name || 'User'}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
            
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  onSignOut()
                  setShowAvatarMenu(false)
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign Out
              </button>
              {onDeleteAccount && (
                <button
                  onClick={() => {
                    onDeleteAccount()
                    setShowAvatarMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}