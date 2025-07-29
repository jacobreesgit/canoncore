'use client'

import { useState } from 'react'
import { ReactNode } from 'react'
import Link from 'next/link'
import { HStack, SectionHeader, ActionButton, IconButton, MenuIcon, CloseIcon, UserAvatar, Breadcrumbs, HeaderTitle } from '@/components/ui'
import { UserProfile, NavigationSidebar } from '@/components/shared'
import { getUserInitials } from '@/lib/page-utils'
import { useProfile, useAvatarUrl } from '@/hooks/use-profile'
import Image from 'next/image'

interface ResponsiveHeaderProps {
  // Page title
  title: string
  subtitle?: string  
  icon?: string

  // User info
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  onEditProfile?: () => void

  // Primary action
  pageActions?: ReactNode

  // Page type - determines header layout
  isUserPage?: boolean

  // Breadcrumbs (only for non-top-level pages)
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function ResponsiveHeader({
  title,
  subtitle,
  icon,
  user,
  onSignOut,
  onDeleteAccount,
  onEditProfile,
  pageActions,
  isUserPage = false,
  breadcrumbs = [],
}: ResponsiveHeaderProps) {
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  const { data: profile } = useProfile()
  const avatarUrl = useAvatarUrl(user, profile)

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
        {/* Breadcrumbs (only for non-top-level pages) */}
        {breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                {/* Show icon emoji OR user avatar */}
                {icon ? (
                  icon === '🌍' ? (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Image
                        src="/globe.png"
                        alt="Public Universes"
                        width={48}
                        height={48}
                        className="w-12 h-12"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center text-4xl">
                      {icon}
                    </div>
                  )
                ) : isUserPage ? (
                  /* Large clickable avatar for user pages */
                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-2 p-2"
                    >
                      <UserAvatar 
                        user={user}
                        size="xl"
                      />
                    </button>
                    
                    {/* Large Avatar Dropdown Menu */}
                    {showUserDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setShowUserDropdown(false)}
                        />
                        <div className="absolute left-0 mt-1 min-w-48 w-max max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="font-medium text-gray-900 truncate">{profile?.full_name || user?.user_metadata?.full_name || 'User'}</div>
                            <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                          </div>
                          {onEditProfile && (
                            <ActionButton
                              onClick={() => {
                                onEditProfile()
                                setShowUserDropdown(false)
                              }}
                              variant="primary"
                              size="sm"
                              className="w-full justify-start"
                            >
                              Edit Profile
                            </ActionButton>
                          )}
                          {onDeleteAccount && (
                            <ActionButton
                              onClick={() => {
                                onDeleteAccount()
                                setShowUserDropdown(false)
                              }}
                              variant="danger"
                              size="sm"
                              className="w-full justify-start"
                            >
                              Delete Account
                            </ActionButton>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : title || subtitle ? (
                  /* Static avatar for non-user pages with content */
                  <UserAvatar 
                    user={user}
                    size="xl"
                  />
                ) : null}
                
                <div>
                  <HeaderTitle level={1}>{title}</HeaderTitle>
                  {subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{subtitle}{profile?.bio && ` • ${profile.bio}`}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {pageActions && (
                  <div className="flex-shrink-0">
                    {pageActions}
                  </div>
                )}
                
                {/* Small User Avatar for non-user pages */}
                {!isUserPage && (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-2 p-2"
                    >
                      <UserAvatar 
                        user={user}
                        size="md"
                      />
                    </button>
                    
                    {/* Small Avatar Dropdown Menu */}
                    {showUserDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setShowUserDropdown(false)}
                        />
                        <div className="absolute right-0 mt-1 min-w-48 w-max max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="font-medium text-gray-900 truncate">{profile?.full_name || user?.user_metadata?.full_name || 'User'}</div>
                            <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                          </div>
                          {onEditProfile && (
                            <ActionButton
                              onClick={() => {
                                onEditProfile()
                                setShowUserDropdown(false)
                              }}
                              variant="primary"
                              size="sm"
                              className="w-full justify-start"
                            >
                              Edit Profile
                            </ActionButton>
                          )}
                          {onDeleteAccount && (
                            <ActionButton
                              onClick={() => {
                                onDeleteAccount()
                                setShowUserDropdown(false)
                              }}
                              variant="danger"
                              size="sm"
                              className="w-full justify-start"
                            >
                              Delete Account
                            </ActionButton>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hamburger Menu Overlay */}
      {showHamburgerMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/55"
            onClick={() => setShowHamburgerMenu(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <HStack justify="between" align="center">
                <HeaderTitle level={2}>Menu</HeaderTitle>
                <IconButton
                  onClick={() => setShowHamburgerMenu(false)}
                  aria-label="Close menu"
                  size="md"
                >
                  <CloseIcon />
                </IconButton>
              </HStack>
            </div>
            
            {/* Navigation Section */}
            <div className="p-4 border-b border-gray-200">
              <NavigationSidebar 
                currentUsername={user?.username} 
                user={user}
                onSignOut={onSignOut}
              />
            </div>

            {/* User Profile Section */}
            <div className="p-4">
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
                onEditProfile={onEditProfile ? () => {
                  onEditProfile()
                  setShowHamburgerMenu(false)
                } : undefined}
                variant="compact"
                size="md"
                showEditButton={!!onEditProfile}
                showSignOut={false}
              />
            </div>

          </div>
        </div>
      )}

    </>
  )
}