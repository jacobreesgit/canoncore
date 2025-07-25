#!/usr/bin/env node

/**
 * User Scanner Script
 * 
 * Scans all users in the Supabase auth system using the service role key.
 * Displays user information including email, creation date, and last sign in.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function scanUsers() {
  try {
    console.log('🔍 Scanning Supabase users...\n')

    // Get all users using admin API
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Error fetching users:', error.message)
      return
    }

    const users = data.users
    console.log(`📊 Found ${users.length} users in the database\n`)

    if (users.length === 0) {
      console.log('No users found.')
      return
    }

    // Display user information
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email || 'N/A'}`)
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
      console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`)
      console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`   Provider: ${user.app_metadata?.provider || 'email'}`)
      
      // Show user metadata if available
      if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
        console.log(`   Metadata:`, JSON.stringify(user.user_metadata, null, 6))
      }
      
      console.log('') // Empty line for separation
    })

    // Show summary statistics
    console.log('📈 Summary:')
    console.log(`   Total Users: ${users.length}`)
    console.log(`   Confirmed Emails: ${users.filter(u => u.email_confirmed_at).length}`)
    console.log(`   Google Auth Users: ${users.filter(u => u.app_metadata?.provider === 'google').length}`)
    console.log(`   Recent Signins (last 7 days): ${users.filter(u => {
      if (!u.last_sign_in_at) return false
      const signInDate = new Date(u.last_sign_in_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return signInDate > weekAgo
    }).length}`)

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

async function scanUserData() {
  try {
    console.log('\n🗄️  Scanning user data in application tables...\n')

    // Get universes count by user
    const { data: universes, error: universesError } = await supabase
      .from('universes')
      .select('user_id, name, created_at')

    if (universesError) {
      console.error('❌ Error fetching universes:', universesError.message)
      return
    }

    // Group universes by user
    const universesByUser = {}
    universes.forEach(universe => {
      if (!universesByUser[universe.user_id]) {
        universesByUser[universe.user_id] = []
      }
      universesByUser[universe.user_id].push(universe)
    })

    console.log(`📚 Found ${universes.length} universes across ${Object.keys(universesByUser).length} users\n`)

    // Display user data summary
    for (const [userId, userUniverses] of Object.entries(universesByUser)) {
      console.log(`🌟 User ${userId}:`)
      console.log(`   Universes: ${userUniverses.length}`)
      userUniverses.forEach(universe => {
        console.log(`   - "${universe.name}" (created ${new Date(universe.created_at).toLocaleDateString()})`)
      })
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error scanning user data:', error.message)
  }
}

// Main execution
async function main() {
  console.log('🚀 CanonCore User Scanner')
  console.log('==========================\n')
  
  await scanUsers()
  await scanUserData()
  
  console.log('✅ Scan complete!')
}

main().catch(console.error)