'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  full_name?: string
  avatar_url?: string
  bio?: string
  website?: string
}

// Get current user's profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data as Profile
    },
  })
}

// Get any user's profile by user ID (for public data)
export function useProfileByUserId(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId, // Only run query if userId is provided
  })
}

// Update current user's profile
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updateData: ProfileUpdateData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as Profile
    },
    onSuccess: (updatedProfile) => {
      // Update the profile cache for current user
      queryClient.setQueryData(['profile'], updatedProfile)
      
      // Also update the profile cache with user ID (used by UserAvatar component)
      queryClient.setQueryData(['profile', updatedProfile.id], updatedProfile)
      
      // Invalidate all profile-related queries to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['universes'] })
    },
  })
}

// Upload avatar image to Supabase Storage (without automatic profile update)
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create unique filename with user ID as folder for RLS
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL with cache buster
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return `${publicUrl}?t=${Date.now()}`
    },
  })
}

// Remove avatar (set back to null to use Google default or initials)
export function useRemoveAvatar() {
  const updateProfile = useUpdateProfile()
  
  return useMutation({
    mutationFn: async () => {
      await updateProfile.mutateAsync({ avatar_url: undefined })
    },
  })
}

// Get avatar URL with fallback logic
export function useAvatarUrl(user: any, profile?: Profile | null) {
  // Priority: 1. Custom uploaded avatar, 2. Profile avatar_url (may contain Google avatar), 3. Google avatar from user_metadata, 4. null (will show initials)
  if (profile?.avatar_url) {
    return profile.avatar_url
  }
  
  if (user?.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url
  }
  
  return null
}