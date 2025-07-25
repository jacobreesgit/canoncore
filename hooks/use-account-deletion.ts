'use client'

import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { deleteUserAccount } from '@/app/actions/delete-account'

interface AccountDeletionData {
  confirmationText: string
}

export function useDeleteAccount() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: AccountDeletionData) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Call server action to perform complete deletion
      const result = await deleteUserAccount(user.id, data.confirmationText)
      
      if (!result.success) {
        throw new Error(result.error || 'Account deletion failed')
      }

      // Sign out the user after successful deletion
      // Note: This may fail with 403 since user is already deleted from auth system
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError && signOutError.message !== 'Invalid session') {
        console.warn('Error signing out after deletion:', signOutError)
        // Don't throw here since the account is already deleted successfully
      }

      return result
    },
    onSuccess: () => {
      // Redirect to home page after successful deletion
      router.push('/')
    },
    onError: (error) => {
      console.error('Account deletion error:', error)
    }
  })
}