'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface NavigationSidebarProps {
  currentUsername?: string
}

interface NavigationItem {
  id: string
  emoji: string
  label: string
  href: string
  isActive?: boolean
}

export function NavigationSidebar({ currentUsername }: NavigationSidebarProps) {
  const pathname = usePathname()
  
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      emoji: '🏠',
      label: 'Dashboard',
      href: currentUsername ? `/${currentUsername}` : '/',
      isActive: currentUsername ? pathname === `/${currentUsername}` : pathname === '/'
    },
    {
      id: 'public-universes',
      emoji: '🌍',
      label: 'Browse Public',
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
          <span 
            className={`text-lg mr-3 transition-transform ${
              item.isActive ? '' : 'group-hover:scale-110'
            }`}
          >
            {item.emoji}
          </span>
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}