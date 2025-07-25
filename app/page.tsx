'use client'

import { useAuth } from '@/contexts/auth-context'
import { LoadingPlaceholder } from '@/components/ui'
import { AuthForm } from '@/components/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { extractUsernameFromEmail } from '@/lib/username'

export default function Home() {
  const { user, loading } = useAuth()
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingPlaceholder title="Redirecting to your universes..." />
    </div>
  )
}
