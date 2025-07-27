'use client'

import { getUserInitials } from '@/lib/page-utils'

interface UserAvatarProps {
  user: any
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export function UserAvatar({ 
  user, 
  size = 'md', 
  className = '',
  onClick 
}: UserAvatarProps) {
  if (!user) return null

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-10 h-10 text-base'
  }
  
  const sizeClass = sizeClasses[size]
  const clickable = onClick ? 'cursor-pointer hover:bg-blue-600 transition-colors' : ''
  
  return (
    <div className={`relative ${className}`}>
      {user.user_metadata?.avatar_url ? (
        <img
          src={user.user_metadata.avatar_url}
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
        className={`${sizeClass} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${user.user_metadata?.avatar_url ? 'hidden' : ''} ${clickable}`}
        onClick={onClick}
      >
        {getUserInitials(user)}
      </div>
    </div>
  )
}