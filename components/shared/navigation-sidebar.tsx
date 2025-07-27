'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getUserInitials } from '@/lib/page-utils'

interface NavigationSidebarProps {
  currentUsername?: string
  user?: any
}

interface NavigationItem {
  id: string
  emoji?: string
  icon?: string
  avatar?: boolean
  label: string
  href: string
  isActive?: boolean
}

export function NavigationSidebar({ currentUsername, user }: NavigationSidebarProps) {
  const pathname = usePathname()
  
  const userDisplayName = user?.user_metadata?.full_name || (currentUsername ? currentUsername.charAt(0).toUpperCase() + currentUsername.slice(1) : 'Dashboard')
  
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      avatar: true,
      label: userDisplayName,
      href: currentUsername ? `/${currentUsername}` : '/',
      isActive: currentUsername ? pathname === `/${currentUsername}` : pathname === '/'
    },
    {
      id: 'public-universes',
      icon: '/globe.png',
      label: 'Browse Public Universes',
      href: '/public-universes',
      isActive: pathname === '/public-universes'
    }
    // Future: Favourites will be added here
  ]

  return (
    <div className="space-y-1">
      {navigationItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors group ${
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
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs ${user?.user_metadata?.avatar_url ? 'hidden' : ''}`} style={{ fontSize: '11px' }}>
                {getUserInitials(user)}
              </div>
            </div>
          ) : item.icon ? (
            // Icon Image
            <div className="mr-3 flex-shrink-0">
              <img
                src={item.icon}
                alt={item.label}
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
    </div>
  )
}