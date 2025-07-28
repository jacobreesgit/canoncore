'use client'

import { getUserInitials } from '@/lib/page-utils'
import { useAvatarUrl, useProfileByUserId } from '@/hooks/use-profile'

interface UserAvatarProps {
  user?: any
  userId?: string // For when we only have user ID (like from universes table)
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  onClick?: () => void
}

export function UserAvatar({ 
  user, 
  userId,
  size = 'md', 
  className = '',
  onClick 
}: UserAvatarProps) {
  // If we have userId but no user object, fetch profile by ID
  const { data: profileById } = useProfileByUserId(userId && !user ? userId : undefined)
  const userToUse = user || (profileById ? { id: userId } : null)
  
  // Use the profile data to get avatar URL
  const { data: profile } = useProfileByUserId(userToUse?.id)
  const avatarUrl = useAvatarUrl(userToUse, profile)
  
  if (!userToUse) return null

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',  // 24px avatar, 10px text
    md: 'w-8 h-8 text-sm',      // 32px avatar, 14px text 
    lg: 'w-10 h-10 text-lg',    // 40px avatar, 18px text
    xl: 'w-12 h-12 text-xl',    // 48px avatar, 20px text
    '2xl': 'w-32 h-32 text-5xl' // 128px avatar, 48px text
  }
  
  const sizeClass = sizeClasses[size]
  const clickable = onClick ? 'cursor-pointer hover:bg-blue-600 transition-colors' : ''
  
  return (
    <div className={`relative ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className={`${sizeClass} rounded-full ${clickable}`}
          onClick={onClick}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div 
        className={`${sizeClass} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${avatarUrl ? 'hidden' : ''} ${clickable}`}
        onClick={onClick}
      >
        {getUserInitials(userToUse)}
      </div>
    </div>
  )
}