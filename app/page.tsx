'use client'

import { useAuth } from '@/contexts/auth-context'
import { LoadingPlaceholder } from '@/components/ui'
import { ActionButton } from '@/components/ui/action-button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { extractUsernameFromEmail } from '@/lib/username'

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to their profile page
  useEffect(() => {
    if (user && user.email) {
      const userUsername = extractUsernameFromEmail(user.email)
      router.push(`/${userUsername}`)
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPlaceholder title="Loading CanonCore..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">CanonCore</h1>
          <p className="text-lg text-gray-600">
            Content organisation platform for expanded universes
          </p>
          <ActionButton
            onClick={signInWithGoogle}
            variant="primary"
            size="lg"
          >
            Sign in with Google
          </ActionButton>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPlaceholder title="Redirecting to your universes..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">CanonCore</h1>
        <p className="text-lg text-gray-600">
          Content organisation platform for expanded universes
        </p>
        <ActionButton
          onClick={signInWithGoogle}
          variant="primary"
          size="lg"
        >
          Sign in with Google
        </ActionButton>
      </div>
    </div>
  )
}
