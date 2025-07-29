'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useFormError, fieldValidators } from '@/hooks/use-form-error'
import { ActionButton, VStack, HStack, Input, IconButton, CloseIcon, Textarea, HeaderTitle } from '@/components/ui'
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
  const { setError, clearError, handleSubmitError, validateField } = useFormError()

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      clearError()
      await signInWithGoogle()
      onSuccess?.()
    } catch (err) {
      handleSubmitError(err, { toastTitle: 'Sign In Failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()

    try {
      // Client-side validation
      if (mode === 'signup') {
        const emailValid = validateField('email', email, [fieldValidators.required, fieldValidators.email])
        const passwordValid = validateField('password', password, [fieldValidators.required, fieldValidators.minLength(6)])
        const confirmPasswordValid = validateField('confirmPassword', confirmPassword, [fieldValidators.required, fieldValidators.matchField(password, 'password')])
        
        if (!emailValid || !passwordValid || !confirmPasswordValid) {
          return
        }
        
        const profileData = {
          fullName: fullName.trim() || undefined,
          bio: bio.trim() || undefined,
          avatarFile: avatarFile || undefined
        }
        
        const { error } = await signUpWithEmail(email, password, profileData)
        if (error) {
          handleSubmitError(error, { toastTitle: 'Sign Up Failed' })
        } else {
          setMode('signin')
          resetForm()
        }
      } else if (mode === 'signin') {
        const emailValid = validateField('email', email, [fieldValidators.required, fieldValidators.email])
        const passwordValid = validateField('password', password, [fieldValidators.required])
        
        if (!emailValid || !passwordValid) {
          return
        }
        
        const { error } = await signInWithEmail(email, password)
        if (error) {
          handleSubmitError(error, { toastTitle: 'Sign In Failed' })
        } else {
          onSuccess?.()
        }
      } else if (mode === 'reset') {
        const emailValid = validateField('email', email, [fieldValidators.required, fieldValidators.email])
        
        if (!emailValid) {
          return
        }
        
        const { error } = await resetPassword(email)
        if (error) {
          handleSubmitError(error, { toastTitle: 'Reset Failed' })
        } else {
          setMode('signin')
          setEmail('')
        }
      }
    } catch (err) {
      handleSubmitError(err, { toastTitle: 'Unexpected Error' })
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
      <Link href="/" className="absolute top-4 right-4">
        <IconButton
          aria-label="Close and return to homepage"
          size="md"
          className="text-gray-400 hover:text-gray-600"
        >
          <CloseIcon />
        </IconButton>
      </Link>

      <div className="text-center">
        <HeaderTitle level={1}>CanonCore</HeaderTitle>
        <p className="text-sm text-gray-600 mt-1">Content organisation platform for expanded universes</p>
      </div>

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

        <div className="relative py-4">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <div className="px-3">
              <span className="text-sm text-gray-500">or</span>
            </div>
            <div className="flex-1 border-t border-gray-300" />
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth}>
          <VStack spacing="md">
            <div>
              <Input
                id="email"
                type="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <Input
                  type="password"
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <Input
                  type="password"
                    id="confirmPassword"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
                
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
                      variant="primary"
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
                            setError('Image must be smaller than 5MB', { showToast: true, toastTitle: 'File Too Large' })
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
              variant="primary"
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