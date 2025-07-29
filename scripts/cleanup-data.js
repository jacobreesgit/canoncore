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
const cleanupType = args.find(arg => ['--test', '--all'].includes(arg)) || '--test'

// Demo user cleanup removed - we never delete demo users

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
  
  const { data: users } = await supabase.auth.admin.listUsers()
  
  if (isDryRun) {
    console.log(`🔍 DRY RUN - Would delete ALL ${users.users.length} users and data`)
    return
  }

  console.log(`📊 Found ${users.users.length} users to delete\n`)
  console.log('🗑️  Deleting all data in correct order...')

  try {
    // Delete all data in correct order (referential integrity)
    
    // 1. Delete all content versions
    console.log('  - Deleting content versions...')
    const { error: versionsError } = await supabase
      .from('content_versions')
      .delete()
      .neq('id', 'impossible-value') // Delete all rows
    
    if (versionsError) console.log(`    Warning: ${versionsError.message}`)

    // 2. Delete all content links/relationships
    console.log('  - Deleting content links...')
    const { error: linksError } = await supabase
      .from('content_links')
      .delete()
      .neq('id', 'impossible-value')
    
    if (linksError) console.log(`    Warning: ${linksError.message}`)

    // 3. Delete all content placements
    console.log('  - Deleting content placements...')
    const { error: placementsError } = await supabase
      .from('content_placements')
      .delete()
      .neq('id', 'impossible-value')
    
    if (placementsError) console.log(`    Warning: ${placementsError.message}`)

    // 4. Delete all content items
    console.log('  - Deleting content items...')
    const { error: contentError } = await supabase
      .from('content_items')
      .delete()
      .neq('id', 'impossible-value')
    
    if (contentError) console.log(`    Warning: ${contentError.message}`)

    // 5. Delete all custom organisation types
    console.log('  - Deleting custom organisation types...')
    const { error: customTypesError } = await supabase
      .from('custom_organisation_types')
      .delete()
      .neq('id', 'impossible-value')
    
    if (customTypesError) console.log(`    Warning: ${customTypesError.message}`)

    // 6. Delete all disabled organisation types
    console.log('  - Deleting disabled organisation types...')
    const { error: disabledTypesError } = await supabase
      .from('disabled_organisation_types')
      .delete()
      .neq('id', 'impossible-value')
    
    if (disabledTypesError) console.log(`    Warning: ${disabledTypesError.message}`)

    // 7. Delete all custom relationship types
    console.log('  - Deleting custom relationship types...')
    const { error: customRelTypesError } = await supabase
      .from('custom_relationship_types')
      .delete()
      .neq('id', 'impossible-value')
    
    if (customRelTypesError) console.log(`    Warning: ${customRelTypesError.message}`)

    // 8. Delete all disabled relationship types
    console.log('  - Deleting disabled relationship types...')
    const { error: disabledRelTypesError } = await supabase
      .from('disabled_relationship_types')
      .delete()
      .neq('id', 'impossible-value')
    
    if (disabledRelTypesError) console.log(`    Warning: ${disabledRelTypesError.message}`)

    // 9. Delete all universe versions
    console.log('  - Deleting universe versions...')
    const { error: univVersionsError } = await supabase
      .from('universe_versions')
      .delete()
      .neq('id', 'impossible-value')
    
    if (univVersionsError) console.log(`    Warning: ${univVersionsError.message}`)

    // 10. Delete all universes
    console.log('  - Deleting universes...')
    const { error: universesError } = await supabase
      .from('universes')
      .delete()
      .neq('id', 'impossible-value')
    
    if (universesError) console.log(`    Warning: ${universesError.message}`)

    // 11. Delete all profiles
    console.log('  - Deleting profiles...')
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', 'impossible-value')
    
    if (profilesError) console.log(`    Warning: ${profilesError.message}`)

    // 12. Delete all auth users
    console.log('  - Deleting auth users...')
    let deletedUsers = 0
    for (const user of users.users) {
      const { error: userError } = await supabase.auth.admin.deleteUser(user.id)
      if (userError) {
        console.log(`    Warning: Failed to delete user ${user.email}: ${userError.message}`)
      } else {
        deletedUsers++
        console.log(`    ✅ Deleted user: ${user.email}`)
      }
    }

    console.log(`\n🎉 Complete cleanup finished! Deleted ${deletedUsers} users and all associated data.`)

  } catch (error) {
    console.error('❌ Error during complete cleanup:', error.message)
    throw error
  }
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

      // Delete organisation types
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
      case '--test':
        await cleanupTestData()
        break
      case '--all':
        await cleanupAll()
        break
      default:
        console.log('Usage: npm run cleanup-data [--test|--all] [--dry-run]')
        console.log('')
        console.log('Options:')
        console.log('  --test     Clean up test user accounts (default)')
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