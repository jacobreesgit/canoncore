'use client'

import { useAuth } from '@/contexts/auth-context'
import { LoadingWrapper, Card } from '@/components/ui'
import { AuthForm } from '@/components/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getCurrentUsername } from '@/lib/username-utils'

export default function SignInPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to their profile page
  useEffect(() => {
    if (user) {
      const userUsername = getCurrentUsername(user)
      if (userUsername) {
        router.push(`/${userUsername}`)
      }
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Loading..."
        >
          <div />
        </LoadingWrapper>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingWrapper 
          isLoading={true}
          fallback="placeholder"
          title="Redirecting to your universes..."
        >
          <div />
        </LoadingWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <Card className="bg-white/80 backdrop-blur-sm p-8">
          <AuthForm />
        </Card>
      </div>
    </div>
  )
}