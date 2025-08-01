'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { UserAvatar, ActionButton, VStack } from '@/components/ui'
import { getCurrentUsername, isCurrentUserPage, getCurrentUserProfileUrl } from '@/lib/username-utils'
import Image from 'next/image'

interface NavigationItem {
  id: string
  emoji?: string
  icon?: string
  avatar?: boolean
  label: string
  href: string
  isActive?: boolean
}

interface NavigationMenuProps {
  user?: any
  onSignOut?: () => void
}

export function NavigationMenu({ user, onSignOut }: NavigationMenuProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Check if accessed from public browsing context
  const fromPublic = searchParams.get('from') === 'public'
  
  // Use utility functions for consistent username handling
  const currentUserUsername = getCurrentUsername(user)
  const isOwnUserPage = isCurrentUserPage(pathname, user)
  const userProfileUrl = getCurrentUserProfileUrl(user)
  
  const userDisplayName = user?.user_metadata?.full_name || (currentUserUsername ? currentUserUsername.charAt(0).toUpperCase() + currentUserUsername.slice(1) : 'Dashboard')
  
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      emoji: '🏠',
      label: 'Home',
      href: '/',
      isActive: pathname === '/' && !fromPublic
    },
    // Only show dashboard for authenticated users
    ...(user ? [
      {
        id: 'dashboard',
        avatar: true,
        label: `${userDisplayName}'s Universes`,
        href: userProfileUrl,
        isActive: isOwnUserPage && !fromPublic
      }
    ] : []),
    {
      id: 'public-universes',
      icon: '/globe.png',
      label: 'Public Universes',
      href: '/public-universes',
      isActive: pathname === '/public-universes' || fromPublic
    }
  ]

  return (
    <div className="flex flex-col h-full">
      <VStack spacing="xs" className="flex-1">
        {navigationItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center px-3 py-3 text-sm rounded-lg transition-colors group ${
              item.isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            {item.avatar ? (
              // User Avatar
              <div className={`mr-3 flex-shrink-0 transition-transform ${
                item.isActive ? '' : 'group-hover:scale-110'
              }`}>
                <UserAvatar 
                  user={user}
                  size="sm"
                />
              </div>
            ) : item.icon ? (
              // Icon Image
              <div className="mr-3 flex-shrink-0">
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? '' : 'group-hover:scale-110'
                  }`}
                />
              </div>
            ) : (
              // Regular Emoji
              <span 
                className={`text-lg mr-3 transition-transform ${
                  item.isActive ? '' : 'group-hover:scale-110'
                }`}
              >
                {item.emoji}
              </span>
            )}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </VStack>
      
      {/* Sign In button for unauthenticated users */}
      {!user && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link href="/auth/signin">
            <ActionButton variant="primary" className="w-full">
              Sign In
            </ActionButton>
          </Link>
        </div>
      )}
      
      {/* Sign Out button for authenticated users */}
      {user && onSignOut && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <ActionButton 
            variant="primary" 
            className="w-full"
            onClick={onSignOut}
          >
            Sign Out
          </ActionButton>
        </div>
      )}
    </div>
  )
}