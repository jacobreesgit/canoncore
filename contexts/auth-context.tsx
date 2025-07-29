'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string, profileData?: { fullName?: string; bio?: string; avatarFile?: File }) => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to copy Google avatar to our storage
async function copyGoogleAvatar(user: User): Promise<string | null> {
  try {
    let googleAvatarUrl = user.user_metadata?.avatar_url
    if (!googleAvatarUrl) return null

    // Convert Google avatar URL to highest resolution
    // Google avatar URLs typically end with =s96-c (96px) or similar
    // Remove size parameters to get full resolution, or use =s2048-c for max size
    if (googleAvatarUrl.includes('googleusercontent.com')) {
      // Remove existing size parameters and add high resolution
      googleAvatarUrl = googleAvatarUrl.replace(/=s\d+-c?$/, '') + '=s2048-c'
    }

    console.log('Copying Google avatar for user:', user.id, 'at high resolution:', googleAvatarUrl)

    // Fetch the image from Google
    const response = await fetch(googleAvatarUrl)
    if (!response.ok) {
      console.error('Failed to fetch Google avatar:', response.status)
      return null
    }

    const blob = await response.blob()
    
    // Create unique filename
    const fileExt = 'jpg' // Google avatars are typically JPEGs
    const fileName = `google-${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Failed to upload avatar:', uploadError)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    console.log('Successfully copied Google avatar:', publicUrl)
    return `${publicUrl}?t=${Date.now()}`

  } catch (error) {
    console.error('Error copying Google avatar:', error)
    return null
  }
}

// Helper function to create profile from stored data
async function handlePendingProfile(user: User) {
  try {
    const pendingProfileData = localStorage.getItem('pendingProfile')
    const pendingAvatarFile = localStorage.getItem('pendingAvatarFile')
    
    if (!pendingProfileData) return
    
    const profileData = JSON.parse(pendingProfileData)
    
    // Upload avatar if exists
    let avatarUrl = null
    if (pendingAvatarFile && profileData.hasAvatar) {
      // Convert base64 back to file
      const response = await fetch(pendingAvatarFile)
      const blob = await response.blob()
      const file = new File([blob], 'avatar.jpg', { type: blob.type })
      
      // Upload to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        avatarUrl = `${publicUrl}?t=${Date.now()}`
      }
    }
    
    // Create/update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: profileData.fullName || null,
        bio: profileData.bio || null,
        avatar_url: avatarUrl
      })
    
    if (!profileError) {
      // Clean up stored data
      localStorage.removeItem('pendingProfile')
      localStorage.removeItem('pendingAvatarFile')
    }
  } catch (error) {
    console.error('Error creating profile:', error)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    // Check for recovery tokens in URL
    const checkRecoveryToken = () => {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const token = params.get('token')
      
      if (type === 'recovery' && token) {
        window.location.href = '/auth/reset-password'
        return
      }
    }

    // Check for recovery token first
    checkRecoveryToken()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If it's a recovery event, redirect to reset password
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/auth/reset-password'
        return
      }
      
      // Handle pending profile creation after email confirmation
      if (event === 'SIGNED_IN' && session?.user) {
        await handlePendingProfile(session.user)
        
        // If user signed in with Google and doesn't have a custom avatar, copy Google avatar
        const isGoogleAuth = session.user.app_metadata?.provider === 'google'
        
        if (isGoogleAuth) {
          // Check if user already has a custom avatar
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url') 
            .eq('id', session.user.id)
            .single()
            
          // Copy Google avatar if user doesn't have one OR if it's still a Google URL
          const needsAvatarCopy = profile && (
            !profile.avatar_url || 
            profile.avatar_url.includes('googleusercontent.com')
          )
          
          let profileUpdated = false
          if (needsAvatarCopy) {
            const copiedAvatarUrl = await copyGoogleAvatar(session.user)
            
            if (copiedAvatarUrl) {
              // Update profile with the copied avatar URL
              await supabase
                .from('profiles')
                .update({ avatar_url: copiedAvatarUrl })
                .eq('id', session.user.id)
              profileUpdated = true
            }
          }
          
          // Show combined welcome toast
          if (profileUpdated) {
            toast.success('Welcome!', 'Successfully signed in and profile updated with Google avatar')
          } else {
            toast.success('Welcome!', 'Successfully signed in with Google')
          }
          
          // Show toast for Gmail users to add bio after a short delay
          setTimeout(() => {
            toast.info('Complete Your Profile', 'Add a bio to tell others about yourself')
          }, 2000)
        }
      }
      
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Provide more helpful error message for invalid credentials
    if (error?.message === 'Invalid login credentials') {
      return { error: 'Invalid email or password. If you signed up with Google, please use the "Continue with Google" button instead.' }
    }
    
    return { error: error?.message || null }
  }

  const signUpWithEmail = async (email: string, password: string, profileData?: { fullName?: string; bio?: string; avatarFile?: File }) => {
    // Store profile data in localStorage for use after email confirmation
    if (profileData) {
      const profileDataToStore = {
        fullName: profileData.fullName,
        bio: profileData.bio,
        hasAvatar: !!profileData.avatarFile
      }
      localStorage.setItem('pendingProfile', JSON.stringify(profileDataToStore))
      
      // Store avatar file separately if provided
      if (profileData.avatarFile) {
        // Convert file to base64 for storage
        const reader = new FileReader()
        reader.onload = () => {
          localStorage.setItem('pendingAvatarFile', reader.result as string)
        }
        reader.readAsDataURL(profileData.avatarFile)
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: profileData ? {
          full_name: profileData.fullName
        } : undefined
      },
    })
    
    // Handle case where email already exists with different provider
    if (error?.message === 'User already registered') {
      return { error: 'This email is already registered. Try signing in instead, or use Google if you created your account with Google.' }
    }
    
    return { error: error?.message || null }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    return { error: error?.message || null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    // Redirect to home page after sign out
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signInWithEmail, 
      signUpWithEmail, 
      resetPassword, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}