#!/usr/bin/env node

/**
 * Database Cleanup Script
 * 
 * Safely cleans up development data and test accounts.
 * Provides options for selective or complete cleanup.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const cleanupType = args.find(arg => ['--demo', '--test', '--all'].includes(arg)) || '--demo'

async function cleanupDemoData() {
  console.log('🧹 Cleaning up demo data...')
  
  // Find demo user (check both possible demo emails)
  const { data: users } = await supabase.auth.admin.listUsers()
  const demoUser = users.users.find(u => 
    u.email === 'demo@canoncore.dev' || 
    u.email === 'demo@gmail.com'
  )
  
  if (!demoUser) {
    console.log('ℹ️  No demo user found')
    return
  }

  if (isDryRun) {
    console.log('🔍 DRY RUN - Would delete demo user and all associated data')
    return
  }

  // Get demo user's universes
  const { data: universes } = await supabase
    .from('universes')
    .select('id, name')
    .eq('user_id', demoUser.id)

  if (universes && universes.length > 0) {
    console.log(`  📚 Found ${universes.length} demo universes`)
    
    for (const universe of universes) {
      console.log(`    - ${universe.name}`)
    }
  }

  // Delete user (cascades to all related data)
  await deleteUser(demoUser.id, 'demo user')
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...')
  
  // Find test users (emails containing 'test')
  const { data: users } = await supabase.auth.admin.listUsers()
  const testUsers = users.users.filter(u => 
    u.email?.includes('test') || 
    u.email?.includes('@test.') ||
    u.user_metadata?.username?.includes('test')
  )
  
  if (testUsers.length === 0) {
    console.log('ℹ️  No test users found')
    return
  }

  console.log(`📊 Found ${testUsers.length} test users`)
  
  if (isDryRun) {
    testUsers.forEach(user => {
      console.log(`🔍 DRY RUN - Would delete: ${user.email}`)
    })
    return
  }

  for (const user of testUsers) {
    await deleteUser(user.id, `test user ${user.email}`)
  }
}

async function cleanupAll() {
  console.log('⚠️  DANGER: Cleaning up ALL user data!')
  console.log('This will delete EVERYTHING. Are you sure?')
  
  if (isDryRun) {
    const { data: users } = await supabase.auth.admin.listUsers()
    console.log(`🔍 DRY RUN - Would delete ALL ${users.users.length} users and data`)
    return
  }

  // Add extra confirmation for full cleanup
  console.log('❌ Full cleanup not implemented for safety')
  console.log('Use --demo or --test for safer cleanup options')
}

async function deleteUser(userId, description) {
  try {
    console.log(`🗑️  Deleting ${description}...`)
    
    // Get user's data for reporting
    const { data: universes } = await supabase
      .from('universes')
      .select('id, name')
      .eq('user_id', userId)
    
    const universeIds = universes?.map(u => u.id) || []
    
    // Get content count
    let totalContent = 0
    if (universeIds.length > 0) {
      const { data: content } = await supabase
        .from('content_items')
        .select('id')
        .in('universe_id', universeIds)
      
      totalContent = content?.length || 0
    }

    // Delete in proper order
    if (universeIds.length > 0) {
      // Delete content versions
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id')
        .in('universe_id', universeIds)

      const contentItemIds = contentItems?.map(c => c.id) || []
      
      if (contentItemIds.length > 0) {
        await supabase
          .from('content_versions')
          .delete()
          .in('content_item_id', contentItemIds)
      }

      // Delete content items
      await supabase
        .from('content_items')
        .delete()
        .in('universe_id', universeIds)

      // Delete content types
      await supabase
        .from('custom_content_types')
        .delete()
        .in('universe_id', universeIds)

      await supabase
        .from('disabled_content_types')
        .delete()
        .in('universe_id', universeIds)

      // Delete universe versions
      await supabase
        .from('universe_versions')
        .delete()
        .in('universe_id', universeIds)

      // Delete universes
      await supabase
        .from('universes')
        .delete()
        .eq('user_id', userId)
    }

    // Delete user from auth
    const { error } = await supabase.auth.admin.deleteUser(userId)
    
    if (error) {
      console.error(`❌ Error deleting ${description}:`, error.message)
    } else {
      console.log(`  ✅ Deleted ${description}`)
      console.log(`    - ${universes?.length || 0} universes`)
      console.log(`    - ${totalContent} content items`)
    }

  } catch (error) {
    console.error(`❌ Error deleting ${description}:`, error.message)
  }
}

async function main() {
  console.log('🧹 CanonCore Database Cleanup')
  console.log('=============================\n')

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No data will be deleted\n')
  }

  try {
    switch (cleanupType) {
      case '--demo':
        await cleanupDemoData()
        break
      case '--test':
        await cleanupTestData()
        break
      case '--all':
        await cleanupAll()
        break
      default:
        console.log('Usage: npm run cleanup-data [--demo|--test|--all] [--dry-run]')
        console.log('')
        console.log('Options:')
        console.log('  --demo     Clean up demo user data (default)')
        console.log('  --test     Clean up test user accounts')
        console.log('  --all      Clean up ALL data (dangerous!)')
        console.log('  --dry-run  Show what would be deleted without deleting')
        return
    }

    console.log('\n✅ Cleanup complete!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message)
  }
}

main().catch(console.error)