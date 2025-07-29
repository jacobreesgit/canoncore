'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ActionButton, Card, VStack, PageHeader, Input } from '@/components/ui'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Password updated successfully! Redirecting...')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <VStack spacing="lg" className="w-full max-w-md">
        <PageHeader
          title="Reset Your Password"
          subtitle="Enter your new password below"
          size="lg"
          variant="default"
          className="text-center !bg-transparent"
        />

        <Card padding="lg">
          <form onSubmit={handlePasswordReset}>
            <VStack spacing="md">
            <Input
              type="password"
              id="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your new password"
            />

            <Input
              type="password"
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
            />

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
              variant="primary"
              size="lg"
              className="w-full"
            >
              Update Password
            </ActionButton>
            </VStack>
          </form>

          <div className="text-center">
            <ActionButton
              type="button"
              onClick={() => router.push('/')}
              variant="secondary"
              size="sm"
            >
              Back to sign in
            </ActionButton>
          </div>
        </Card>
      </VStack>
    </div>
  )
}