'use client'

import { ActionButton, HStack, UserAvatar } from '@/components/ui'
import { useProfile } from '@/hooks/use-profile'
import Link from 'next/link'

interface UserProfileProps {
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  onEditProfile?: () => void
  showDeleteAccount?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'header' | 'compact' | 'card'
  showEditButton?: boolean
  showSignOut?: boolean
}

export function UserProfile({ 
  user, 
  onSignOut, 
  onDeleteAccount, 
  onEditProfile,
  showDeleteAccount = false,
  size = 'md',
  variant = 'header',
  showEditButton = false,
  showSignOut = true
}: UserProfileProps) {
  const { data: profile } = useProfile()
  
  if (!user) return null

  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
  
  if (variant === 'compact') {
    return (
      <>
        <HStack spacing="sm" align="center" className="px-3 py-2 bg-gray-100 rounded-lg">
          <UserAvatar 
            user={user}
            size={size}
          />
        <div className={textSize}>
          <div className="font-medium">{profile?.full_name || user.user_metadata?.full_name || 'User'}</div>
        </div>
        {showEditButton && onEditProfile && (
          <ActionButton
            onClick={onEditProfile}
            variant="primary"
            size={size}
          >
            Edit Profile
          </ActionButton>
        )}
        {showSignOut && (
          <ActionButton
            onClick={onSignOut}
            variant="secondary"
            size={size}
          >
            Sign Out
          </ActionButton>
        )}
      </HStack>
    </>
    )
  }

  if (variant === 'card') {
    return (
      <>
        <div className="space-y-4">
          {/* Quick Discovery */}
          <div className="space-y-1">
            <Link 
              href="/public-universes"
              className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
            >
              <span className="text-lg mr-3 group-hover:scale-110 transition-transform">🌍</span>
              <span className="font-medium">Public Universes</span>
            </Link>
            {/* Future: Favourites link will go here */}
          </div>

          {/* User Profile */}
          <div className="px-3 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <HStack spacing="sm" align="center">
              <UserAvatar 
                user={user}
                size={size}
              />
              <div className={`${textSize} flex-1 min-w-0`}>
                <div className="font-medium truncate">{profile?.full_name || user.user_metadata?.full_name || 'User'}</div>
                <div className="text-gray-500 text-xs truncate">{user.email}</div>
              </div>
              {showEditButton && onEditProfile && (
                <ActionButton
                  onClick={onEditProfile}
                  variant="primary"
                  size="sm"
                >
                  Edit
                </ActionButton>
              )}
            </HStack>
          </div>
          
          {/* Account Actions */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {showSignOut && (
              <ActionButton
                onClick={onSignOut}
                variant="secondary"
                size="sm"
                fullWidth
              >
                Sign Out
              </ActionButton>
            )}
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
      </>
    )
  }

  return (
    <>
      <HStack spacing="md" align="center">
        <HStack spacing="sm" align="center" className="px-4 py-2 bg-gray-100 rounded-lg">
          <UserAvatar 
            user={user}
            size={size}
          />
          <div className={textSize}>
            <div className="font-medium">{profile?.full_name || user.user_metadata?.full_name || 'User'}</div>
            <div className="text-gray-500">{user.email}</div>
          </div>
        <HStack spacing="xs" className="ml-2">
          {showEditButton && onEditProfile && (
            <ActionButton
              onClick={onEditProfile}
              variant="primary"
              size={size}
            >
              Edit Profile
            </ActionButton>
          )}
          {showSignOut && (
            <ActionButton
              onClick={onSignOut}
              variant="secondary"
              size={size}
            >
              Sign Out
            </ActionButton>
          )}
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
  </>
  )
}