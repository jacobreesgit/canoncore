'use client'

import { useState } from 'react'
import { ActionButton, HStack, UserAvatar } from '@/components/ui'
import { useProfile } from '@/hooks/use-profile'
import { EditProfileModal } from '@/components/profile'
import Link from 'next/link'

interface UserProfileProps {
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  showDeleteAccount?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'header' | 'compact' | 'card'
  showEditButton?: boolean
}

export function UserProfile({ 
  user, 
  onSignOut, 
  onDeleteAccount, 
  showDeleteAccount = false,
  size = 'md',
  variant = 'header',
  showEditButton = false
}: UserProfileProps) {
  const [showEditModal, setShowEditModal] = useState(false)
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
        <ActionButton
          onClick={onSignOut}
          variant="secondary"
          size={size}
        >
          Sign Out
        </ActionButton>
      </HStack>
      
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
      />
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
              {showEditButton && (
                <ActionButton
                  onClick={() => setShowEditModal(true)}
                  variant="secondary"
                  size="sm"
                >
                  Edit
                </ActionButton>
              )}
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
        
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
        />
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
          {showEditButton && (
            <ActionButton
              onClick={() => setShowEditModal(true)}
              variant="secondary"
              size={size}
            >
              Edit Profile
            </ActionButton>
          )}
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
    
    <EditProfileModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      user={user}
    />
  </>
  )
}