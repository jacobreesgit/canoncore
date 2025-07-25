#!/usr/bin/env node

/**
 * Universe Scanner Script
 * 
 * Scans and analyzes universes in the CanonCore database.
 * Provides detailed information about universe structure, content, and metadata.
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

const args = process.argv.slice(2)
const targetUniverse = args[0] // Optional: specific universe to scan
const showDetails = args.includes('--detailed') || args.includes('-d')

async function scanAllUniverses() {
  try {
    console.log('🌟 Scanning all universes...\n')

    // Get all universes with user information
    const { data: universes, error } = await supabase
      .from('universes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching universes:', error.message)
      return
    }

    if (universes.length === 0) {
      console.log('📭 No universes found in the database.')
      return
    }

    console.log(`📊 Found ${universes.length} universes in the database\n`)

    // Get users for mapping
    const { data: users } = await supabase.auth.admin.listUsers()
    const userMap = new Map(users.users.map(u => [u.id, u]))

    // Display each universe
    for (let i = 0; i < universes.length; i++) {
      const universe = universes[i]
      const user = userMap.get(universe.user_id)
      
      console.log(`🌟 Universe ${i + 1}: "${universe.name}"`)
      console.log(`   ID: ${universe.id}`)
      console.log(`   Slug: ${universe.slug}`)
      console.log(`   Username: ${universe.username}`)
      console.log(`   Owner: ${user?.email || 'Unknown'}`)
      console.log(`   Created: ${new Date(universe.created_at).toLocaleString()}`)
      
      if (universe.description) {
        console.log(`   Description: ${universe.description}`)
      }

      if (showDetails) {
        await displayUniverseDetails(universe.id)
      }
      
      console.log('') // Empty line for separation
    }

    // Show summary statistics
    await displayUniverseSummary(universes)

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

async function scanSpecificUniverse(identifier) {
  try {
    console.log(`🔍 Scanning universe: ${identifier}\n`)

    // Try to find universe by slug, username/slug combo, or ID
    let universe = null
    
    // First try username/slug format (e.g., "jacob/doctor-who")
    if (identifier.includes('/')) {
      const [username, slug] = identifier.split('/')
      const { data } = await supabase
        .from('universes')
        .select('*')
        .eq('username', username)
        .eq('slug', slug)
        .single()
      universe = data
    } 
    // Try just slug
    else if (!identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data } = await supabase
        .from('universes')
        .select('*')
        .eq('slug', identifier)
        .limit(1)
        .single()
      universe = data
    }
    // Try UUID
    else {
      const { data } = await supabase
        .from('universes')
        .select('*')
        .eq('id', identifier)
        .single()
      universe = data
    }

    if (!universe) {
      console.error('❌ Universe not found')
      console.log('💡 Try one of these formats:')
      console.log('   - username/slug (e.g., "jacob/doctor-who")')
      console.log('   - slug (e.g., "doctor-who")')
      console.log('   - UUID (e.g., "123e4567-e89b-12d3-a456-426614174000")')
      return
    }

    // Get user information
    const { data: userData } = await supabase.auth.admin.getUserById(universe.user_id)
    const user = userData.user

    console.log(`🌟 Universe: "${universe.name}"`)
    console.log(`   ID: ${universe.id}`)
    console.log(`   Slug: ${universe.slug}`)
    console.log(`   Username: ${universe.username}`)
    console.log(`   Owner: ${user?.email || 'Unknown'}`)
    console.log(`   Created: ${new Date(universe.created_at).toLocaleString()}`)
    
    if (universe.description) {
      console.log(`   Description: ${universe.description}`)
    }

    console.log('')
    await displayUniverseDetails(universe.id, true)

  } catch (error) {
    console.error('❌ Error scanning universe:', error.message)
  }
}

async function displayUniverseDetails(universeId, detailed = false) {
  try {
    // Get content items
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .eq('universe_id', universeId)
      .order('order_index')

    if (contentError) {
      console.log('   ⚠️  Error fetching content items')
      return
    }

    // Get universe versions
    const { data: versions } = await supabase
      .from('universe_versions')
      .select('*')
      .eq('universe_id', universeId)
      .order('version_number')

    // Get custom content types
    const { data: customTypes } = await supabase
      .from('custom_content_types')
      .select('*')
      .eq('universe_id', universeId)

    // Get disabled content types
    const { data: disabledTypes } = await supabase
      .from('disabled_content_types')
      .select('*')
      .eq('universe_id', universeId)

    console.log(`   📊 Statistics:`)
    console.log(`      Content Items: ${contentItems?.length || 0}`)
    console.log(`      Universe Versions: ${versions?.length || 0}`)
    console.log(`      Custom Types: ${customTypes?.length || 0}`)
    console.log(`      Disabled Types: ${disabledTypes?.length || 0}`)

    if (detailed) {
      // Show universe versions
      if (versions && versions.length > 0) {
        console.log('\n   📋 Universe Versions:')
        versions.forEach(version => {
          const current = version.is_current ? ' (Current)' : ''
          console.log(`      v${version.version_number}: ${version.name}${current}`)
          if (version.description) {
            console.log(`         ${version.description}`)
          }
        })
      }

      // Show custom content types
      if (customTypes && customTypes.length > 0) {
        console.log('\n   🏷️  Custom Content Types:')
        customTypes.forEach(type => {
          console.log(`      ${type.emoji} ${type.name}`)
        })
      }

      // Show disabled content types
      if (disabledTypes && disabledTypes.length > 0) {
        console.log('\n   🚫 Disabled Content Types:')
        disabledTypes.forEach(type => {
          console.log(`      ${type.content_type}`)
        })
      }

      // Show content structure
      if (contentItems && contentItems.length > 0) {
        console.log('\n   📚 Content Structure:')
        await displayContentTree(contentItems)

        // Show content type distribution
        const typeDistribution = {}
        contentItems.forEach(item => {
          typeDistribution[item.content_type] = (typeDistribution[item.content_type] || 0) + 1
        })

        console.log('\n   📊 Content Type Distribution:')
        Object.entries(typeDistribution)
          .sort(([,a], [,b]) => b - a)
          .forEach(([type, count]) => {
            console.log(`      ${type}: ${count}`)
          })

        // Show content with versions
        const { data: contentVersions } = await supabase
          .from('content_versions')
          .select('content_item_id, version_number, is_primary')
          .in('content_item_id', contentItems.map(c => c.id))

        const versionsByContent = {}
        contentVersions?.forEach(version => {
          if (!versionsByContent[version.content_item_id]) {
            versionsByContent[version.content_item_id] = []
          }
          versionsByContent[version.content_item_id].push(version)
        })

        console.log('\n   📝 Content with Multiple Versions:')
        let hasMultipleVersions = false
        contentItems.forEach(item => {
          const versions = versionsByContent[item.id] || []
          if (versions.length > 1) {
            hasMultipleVersions = true
            const primaryVersion = versions.find(v => v.is_primary)?.version_number || 'None'
            console.log(`      "${item.name}": ${versions.length} versions (Primary: v${primaryVersion})`)
          }
        })
        
        if (!hasMultipleVersions) {
          console.log('      No content items with multiple versions')
        }
      }
    }
  } catch (error) {
    console.log('   ⚠️  Error fetching universe details:', error.message)
  }
}

async function displayContentTree(contentItems, parentId = null, depth = 0) {
  const children = contentItems.filter(item => item.parent_id === parentId)
  
  for (const item of children) {
    const indent = '      ' + '  '.repeat(depth)
    const hasChildren = contentItems.some(c => c.parent_id === item.id)
    const icon = hasChildren ? '📁' : '📄'
    
    console.log(`${indent}${icon} ${item.name} (${item.content_type})`)
    
    if (hasChildren) {
      await displayContentTree(contentItems, item.id, depth + 1)
    }
  }
}

async function displayUniverseSummary(universes) {
  console.log('📈 Summary Statistics:')
  console.log(`   Total Universes: ${universes.length}`)

  // Group by user
  const userCounts = {}
  universes.forEach(universe => {
    userCounts[universe.user_id] = (userCounts[universe.user_id] || 0) + 1
  })

  console.log(`   Unique Users: ${Object.keys(userCounts).length}`)
  console.log(`   Avg Universes/User: ${(universes.length / Object.keys(userCounts).length).toFixed(1)}`)

  // Most active users
  const topUsers = Object.entries(userCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  if (topUsers.length > 0) {
    console.log(`   Most Active Users:`)
    const { data: users } = await supabase.auth.admin.listUsers()
    const userMap = new Map(users.users.map(u => [u.id, u]))
    
    topUsers.forEach(([userId, count]) => {
      const user = userMap.get(userId)
      console.log(`      ${user?.email || 'Unknown'}: ${count} universes`)
    })
  }

  // Creation timeline
  const creationByMonth = {}
  universes.forEach(universe => {
    const month = new Date(universe.created_at).toISOString().slice(0, 7)
    creationByMonth[month] = (creationByMonth[month] || 0) + 1
  })

  console.log(`   Recent Activity (last 6 months):`)
  Object.entries(creationByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .forEach(([month, count]) => {
      console.log(`      ${month}: ${count} universes created`)
    })
}

async function main() {
  console.log('🌟 CanonCore Universe Scanner')
  console.log('=============================\n')
  
  try {
    if (targetUniverse) {
      await scanSpecificUniverse(targetUniverse)
    } else {
      await scanAllUniverses()
    }
    
    console.log('✅ Universe scan complete!')

  } catch (error) {
    console.error('❌ Scan failed:', error.message)
  }
}

// Show usage if --help flag is provided
if (args.includes('--help') || args.includes('-h')) {
  console.log('🌟 CanonCore Universe Scanner')
  console.log('=============================\n')
  console.log('Usage: npm run scan-universes [universe] [options]')
  console.log('')
  console.log('Arguments:')
  console.log('  universe          Specific universe to scan (optional)')
  console.log('                    Can be: username/slug, slug, or UUID')
  console.log('')
  console.log('Options:')
  console.log('  --detailed, -d    Show detailed universe information')
  console.log('  --help, -h        Show this help message')
  console.log('')
  console.log('Examples:')
  console.log('  npm run scan-universes')
  console.log('  npm run scan-universes jacob/doctor-who')
  console.log('  npm run scan-universes doctor-who --detailed')
  console.log('  npm run scan-universes --detailed')
  process.exit(0)
}

main().catch(console.error)