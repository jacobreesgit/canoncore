'use client'

import { ActionButton, HStack } from '@/components/ui'
import { getUserInitials } from '@/lib/page-utils'
import Link from 'next/link'

interface UserProfileProps {
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  showDeleteAccount?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'header' | 'compact' | 'card'
}

export function UserProfile({ 
  user, 
  onSignOut, 
  onDeleteAccount, 
  showDeleteAccount = false,
  size = 'md',
  variant = 'header'
}: UserProfileProps) {
  if (!user) return null

  const avatarSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
  
  if (variant === 'compact') {
    return (
      <HStack spacing="sm" align="center" className="px-3 py-2 bg-gray-100 rounded-lg">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className={`${avatarSize} rounded-full`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${avatarSize} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${user.user_metadata?.avatar_url ? 'hidden' : ''} ${textSize}`}>
          {getUserInitials(user)}
        </div>
        <div className={textSize}>
          <div className="font-medium">{user.user_metadata?.full_name || 'User'}</div>
        </div>
        <ActionButton
          onClick={onSignOut}
          variant="secondary"
          size={size}
        >
          Sign Out
        </ActionButton>
      </HStack>
    )
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {/* Quick Discovery */}
        <div className="space-y-1">
          <Link 
            href="/public-universes"
            className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform">🌍</span>
            <span className="font-medium">Browse Public Universes</span>
          </Link>
          {/* Future: Favourites link will go here */}
        </div>

        {/* User Profile */}
        <div className="px-3 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <HStack spacing="sm" align="center">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className={`${avatarSize} rounded-full`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${avatarSize} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${user.user_metadata?.avatar_url ? 'hidden' : ''} ${textSize}`}>
              {getUserInitials(user)}
            </div>
            <div className={`${textSize} flex-1 min-w-0`}>
              <div className="font-medium truncate">{user.user_metadata?.full_name || 'User'}</div>
              <div className="text-gray-500 text-xs truncate">{user.email}</div>
            </div>
          </HStack>
        </div>
        
        {/* Account Actions */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <ActionButton
            onClick={onSignOut}
            variant="secondary"
            size="sm"
            fullWidth
          >
            Sign Out
          </ActionButton>
          {onDeleteAccount && (
            <ActionButton
              onClick={onDeleteAccount}
              variant="danger"
              size="sm"
              fullWidth
            >
              Delete Account
            </ActionButton>
          )}
        </div>
      </div>
    )
  }

  return (
    <HStack spacing="md" align="center">
      <HStack spacing="sm" align="center" className="px-4 py-2 bg-gray-100 rounded-lg">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className={`${avatarSize} rounded-full`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${avatarSize} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${user.user_metadata?.avatar_url ? 'hidden' : ''} ${textSize}`}>
          {getUserInitials(user)}
        </div>
        <div className={textSize}>
          <div className="font-medium">{user.user_metadata?.full_name || 'User'}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>
        <HStack spacing="xs" className="ml-2">
          <ActionButton
            onClick={onSignOut}
            variant="secondary"
            size={size}
          >
            Sign Out
          </ActionButton>
          {showDeleteAccount && onDeleteAccount && (
            <ActionButton
              onClick={onDeleteAccount}
              variant="danger"
              size={size}
            >
              Delete Account
            </ActionButton>
          )}
        </HStack>
      </HStack>
    </HStack>
  )
}