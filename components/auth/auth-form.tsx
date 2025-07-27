'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { ActionButton, Card, VStack, HStack } from '@/components/ui'
import { PasswordInput } from '@/components/auth'

type AuthMode = 'signin' | 'signup' | 'reset'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
      onSuccess?.()
    } catch (err) {
      setError('Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          return
        }
        
        const { error } = await signUpWithEmail(email, password)
        if (error) {
          setError(error)
        } else {
          setMessage('Check your email for a confirmation link')
          setMode('signin')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
      } else if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password)
        if (error) {
          setError(error)
        } else {
          onSuccess?.()
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error)
        } else {
          setMessage('Check your email for a password reset link')
          setMode('signin')
          setEmail('')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setMessage(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <VStack spacing="lg" className="w-full max-w-md">
      <VStack spacing="sm" align="center" className="text-center">
        <h1 className="text-4xl font-bold">CanonCore</h1>
        <p className="text-lg text-gray-600">
          Content organisation platform for expanded universes
        </p>
      </VStack>

      <Card padding="lg">
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
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

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
                <PasswordInput
                  id="confirmPassword"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">{message}</p>
                </div>
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
                  onClick={() => switchMode('signin')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </p>
            )}
          </VStack>
        </VStack>
      </Card>
    </VStack>
  )
}