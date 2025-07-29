'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { ActionButton, VStack, HStack, Input, IconButton, CloseIcon, Textarea, PageHeader } from '@/components/ui'
import { PasswordInput } from '@/components/auth'
import Link from 'next/link'
import Image from 'next/image'

type AuthMode = 'signin' | 'signup' | 'reset'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      onSuccess?.()
    } catch (err) {
      toast.error('Sign In Failed', 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Password Mismatch', 'Passwords do not match')
          return
        }
        if (password.length < 6) {
          toast.error('Password Too Short', 'Password must be at least 6 characters')
          return
        }
        
        const profileData = {
          fullName: fullName.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarFile: avatarFile || undefined
        }
        
        const { error } = await signUpWithEmail(email, password, profileData)
        if (error) {
          toast.error('Sign Up Failed', error)
        } else {
          toast.info('Account Created', 'Check your email for a confirmation link')
          setMode('signin')
          resetForm()
        }
      } else if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password)
        if (error) {
          toast.error('Sign In Failed', error)
        } else {
          toast.success('Welcome Back!', 'Successfully signed in')
          onSuccess?.()
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          toast.error('Reset Failed', error)
        } else {
          toast.info('Reset Email Sent', 'Check your email for a password reset link')
          setMode('signin')
          setEmail('')
        }
      }
    } catch (err) {
      toast.error('Unexpected Error', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setBio('')
    setAvatarFile(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <VStack spacing="lg" className="w-full max-w-md">
      {/* Close button */}
      <div className="flex justify-end">
        <Link href="/">
          <IconButton
            aria-label="Close and return to homepage"
            size="md"
            className="text-gray-400 hover:text-gray-600"
          >
            <CloseIcon />
          </IconButton>
        </Link>
      </div>

      <PageHeader
        title="CanonCore"
        subtitle="Content organisation platform for expanded universes"
        size="lg"
        className="text-center"
      />

      <VStack spacing="md">
        {/* Google Sign In */}
        <ActionButton
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          <HStack spacing="sm" align="center" justify="center">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </HStack>
        </ActionButton>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth}>
          <VStack spacing="md">
            <Input
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />

            {mode !== 'reset' && (
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            )}

            {mode === 'signup' && (
              <>
                <PasswordInput
                  id="confirmPassword"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
                
                {/* Profile Fields */}
                <Input
                  id="fullName"
                  type="text"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
                
                <Textarea
                  id="bio"
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell others about yourself"
                  maxLength={500}
                  showCharCount={true}
                />
                
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    {avatarFile ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <Image
                            src={URL.createObjectURL(avatarFile)}
                            alt="Avatar preview"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <ActionButton
                          type="button"
                          onClick={() => setAvatarFile(null)}
                          variant="danger"
                          size="sm"
                        >
                          Remove
                        </ActionButton>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      </div>
                    )}
                    <ActionButton
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="secondary"
                      size="sm"
                    >
                      Choose Photo
                    </ActionButton>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('File Too Large', 'Image must be smaller than 5MB')
                            return
                          }
                          setAvatarFile(file)
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Max 5MB • JPG, PNG, GIF
                  </div>
                </div>
              </>
            )}


            <ActionButton
              type="submit"
              disabled={loading}
              isLoading={loading}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </ActionButton>
          </VStack>
        </form>

        {/* Mode Switching */}
        <VStack spacing="sm" align="center" className="text-center">
          {mode === 'signin' && (
            <>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </button>
              </p>
              <p className="text-sm text-gray-600">
                Forgot your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Reset it
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          )}
        </VStack>
      </VStack>
    </VStack>
  )
}