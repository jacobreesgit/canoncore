'use client'

import { ActionButton, HStack } from '@/components/ui'
import { getUserInitials } from '@/lib/page-utils'

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
      <div className="space-y-3">
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
            <div className="text-gray-500">{user.email}</div>
          </div>
        </HStack>
        <div className="space-y-2">
          <ActionButton
            onClick={onSignOut}
            variant="secondary"
            size="sm"
            fullWidth
          >
            Sign Out
          </ActionButton>
          {showDeleteAccount && onDeleteAccount && (
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