'use client'

import { useState } from 'react'
import { getUserInitials } from '@/lib/page-utils'
import { useAvatarUrl, useProfileByUserId } from '@/hooks/use-profile'
import Image from 'next/image'

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
  // Determine which user ID to use
  const effectiveUserId = user?.id || userId
  
  // Fetch profile data for the user
  const { data: profile } = useProfileByUserId(effectiveUserId)
  const avatarUrl = useAvatarUrl(user, profile)
  
  // Track image load state
  const [imageError, setImageError] = useState(false)
  
  if (!effectiveUserId) return null

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',  // 24px avatar, 10px text
    md: 'w-8 h-8 text-sm',      // 32px avatar, 14px text 
    lg: 'w-10 h-10 text-lg',    // 40px avatar, 18px text
    xl: 'w-12 h-12 text-xl',    // 48px avatar, 20px text
    '2xl': 'w-32 h-32 text-5xl' // 128px avatar, 48px text
  }
  
  const sizeDimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
    xl: { width: 48, height: 48 },
    '2xl': { width: 128, height: 128 }
  }
  
  const sizeClass = sizeClasses[size]
  const dimensions = sizeDimensions[size]
  const clickable = onClick ? 'cursor-pointer hover:bg-blue-600 transition-colors' : ''
  
  // Show avatar image if URL exists and no error, otherwise show initials
  const showImage = avatarUrl && !imageError
  
  return (
    <div className={`relative ${className}`}>
      {showImage ? (
        <Image
          src={avatarUrl}
          alt="Profile"
          width={dimensions.width}
          height={dimensions.height}
          className={`${sizeClass} rounded-full object-cover ${clickable}`}
          onClick={onClick}
          onError={(e) => {
            console.error('Avatar image failed to load:', avatarUrl)
            setImageError(true)
          }}
          onLoad={() => {
            console.log('Avatar image loaded successfully:', avatarUrl)
          }}
        />
      ) : (
        <div 
          className={`${sizeClass} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${clickable}`}
          onClick={onClick}
        >
          {getUserInitials(user || profile)}
        </div>
      )}
    </div>
  )
}