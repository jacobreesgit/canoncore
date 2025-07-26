'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

interface DeleteAccountResult {
  success: boolean
  error?: string
}

/**
 * Server action to completely delete a user account and all associated data
 * Uses service role key to delete from auth.users table
 */
export async function deleteUserAccount(userId: string, confirmationText: string): Promise<DeleteAccountResult> {
  try {
    // Verify confirmation text
    if (confirmationText !== 'DELETE') {
      return {
        success: false,
        error: 'Please type "DELETE" to confirm account deletion'
      }
    }

    // Create admin client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        success: false,
        error: 'Server configuration error'
      }
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify user exists before attempting deletion
    const { data: userData, error: userCheckError } = await adminClient.auth.admin.getUserById(userId)
    
    if (userCheckError || !userData.user) {
      return {
        success: false,
        error: 'User not found or already deleted'
      }
    }

    // Step 1: Get all user's universe IDs for cascade deletion
    const { data: userUniverses, error: fetchError } = await adminClient
      .from('universes')
      .select('id')
      .eq('user_id', userId)
    
    if (fetchError) {
      console.error('Error fetching universes:', fetchError)
      return {
        success: false,
        error: 'Error fetching user data for deletion'
      }
    }

    const universeIds = userUniverses?.map((u: any) => u.id) || []

    // Step 2: Delete in correct order to respect foreign key constraints
    // Delete content versions first
    if (universeIds.length > 0) {
      const { data: contentItems } = await adminClient
        .from('content_items')
        .select('id')
        .in('universe_id', universeIds)

      const contentItemIds = contentItems?.map((c: any) => c.id) || []

      if (contentItemIds.length > 0) {
        await adminClient
          .from('content_versions')
          .delete()
          .in('content_item_id', contentItemIds)
      }

      // Delete content items
      await adminClient
        .from('content_items')
        .delete()
        .in('universe_id', universeIds)

      // Delete custom organisation types
      await adminClient
        .from('custom_content_types')
        .delete()
        .in('universe_id', universeIds)

      // Delete disabled organisation types
      await adminClient
        .from('disabled_content_types')
        .delete()
        .in('universe_id', universeIds)

      // Delete universe versions
      await adminClient
        .from('universe_versions')
        .delete()
        .in('universe_id', universeIds)
    }

    // Step 3: Delete universes
    const { error: universesError } = await adminClient
      .from('universes')
      .delete()
      .eq('user_id', userId)
    
    if (universesError) {
      console.error('Error deleting universes:', universesError)
      return {
        success: false,
        error: 'Error deleting user universes'
      }
    }

    // Step 4: Delete user from auth.users (the critical step!)
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)
    
    if (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError)
      return {
        success: false,
        error: 'Error deleting user from authentication system'
      }
    }

    // Revalidate any cached data
    revalidatePath('/')

    return { success: true }

  } catch (error) {
    console.error('Unexpected error during account deletion:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during account deletion'
    }
  }
}