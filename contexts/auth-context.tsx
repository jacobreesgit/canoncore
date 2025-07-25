'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for recovery tokens in URL
    const checkRecoveryToken = () => {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const token = params.get('token')
      
      console.log('Checking for recovery token - type:', type, 'token present:', !!token)
      
      if (type === 'recovery' && token) {
        console.log('Recovery token found, redirecting to reset password page')
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      // If it's a recovery event, redirect to reset password
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected, redirecting to reset password page')
        window.location.href = '/auth/reset-password'
        return
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

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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