#!/usr/bin/env node

/**
 * User Analytics & Insights Script
 * 
 * Generates detailed analytics and insights about user behavior,
 * content creation patterns, and platform usage statistics.
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
const reportType = args[0] || 'overview'

async function generateOverview() {
  console.log('📊 Platform Overview')
  console.log('===================\n')

  try {
    // User statistics
    const { data: users } = await supabase.auth.admin.listUsers()
    const totalUsers = users.users.length
    const activeUsers = users.users.filter(u => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return u.last_sign_in_at && new Date(u.last_sign_in_at) > weekAgo
    }).length

    console.log('👥 User Statistics:')
    console.log(`   Total Users: ${totalUsers}`)
    console.log(`   Active (7 days): ${activeUsers}`)
    console.log(`   Google Auth: ${users.users.filter(u => u.app_metadata?.provider === 'google').length}`)
    console.log(`   Email Confirmed: ${users.users.filter(u => u.email_confirmed_at).length}`)

    // Content statistics
    const { data: universes } = await supabase.from('universes').select('*')
    const { data: contentItems } = await supabase.from('content_items').select('*')
    const { data: contentVersions } = await supabase.from('content_versions').select('*')
    const { data: customTypes } = await supabase.from('custom_organisation_types').select('*')

    console.log('\n📚 Content Statistics:')
    console.log(`   Total Universes: ${universes?.length || 0}`)
    console.log(`   Total Content Items: ${contentItems?.length || 0}`)
    console.log(`   Total Versions: ${contentVersions?.length || 0}`)
    console.log(`   Custom Organisation Types: ${customTypes?.length || 0}`)

    if (universes && universes.length > 0) {
      const avgContentPerUniverse = (contentItems?.length || 0) / universes.length
      console.log(`   Avg Content/Universe: ${avgContentPerUniverse.toFixed(1)}`)
    }

    // Top users by content
    if (universes && universes.length > 0) {
      const userActivity = {}
      universes.forEach(universe => {
        userActivity[universe.user_id] = (userActivity[universe.user_id] || 0) + 1
      })

      const topUsers = Object.entries(userActivity)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)

      console.log('\n🏆 Most Active Users:')
      for (const [userId, universeCount] of topUsers) {
        const user = users.users.find(u => u.id === userId)
        const email = user?.email || 'Unknown'
        console.log(`   ${email}: ${universeCount} universes`)
      }
    }

  } catch (error) {
    console.error('❌ Error generating overview:', error.message)
  }
}

async function generateContentReport() {
  console.log('📋 Content Analysis Report')
  console.log('==========================\n')

  try {
    const { data: contentItems } = await supabase
      .from('content_items')
      .select('*, universes(name, user_id)')

    if (!contentItems || contentItems.length === 0) {
      console.log('No content items found')
      return
    }

    // Organisation type distribution
    const typeDistribution = {}
    contentItems.forEach(item => {
      typeDistribution[item.organisation_type] = (typeDistribution[item.organisation_type] || 0) + 1
    })

    console.log('📊 Organisation Type Distribution:')
    Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} items`)
      })

    // Content creation timeline
    const creationByMonth = {}
    contentItems.forEach(item => {
      const month = new Date(item.created_at).toISOString().slice(0, 7)
      creationByMonth[month] = (creationByMonth[month] || 0) + 1
    })

    console.log('\n📅 Content Creation Timeline:')
    Object.entries(creationByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .forEach(([month, count]) => {
        console.log(`   ${month}: ${count} items`)
      })

    // Universe analysis
    const universeStats = {}
    contentItems.forEach(item => {
      const universeName = item.universes?.name || 'Unknown'
      if (!universeStats[universeName]) {
        universeStats[universeName] = { count: 0, types: new Set() }
      }
      universeStats[universeName].count++
      universeStats[universeName].types.add(item.organisation_type)
    })

    console.log('\n🌟 Top Universes by Content:')
    Object.entries(universeStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .forEach(([name, stats]) => {
        console.log(`   ${name}: ${stats.count} items (${stats.types.size} types)`)
      })

  } catch (error) {
    console.error('❌ Error generating content report:', error.message)
  }
}

async function generateUserReport() {
  console.log('👤 User Behavior Report')
  console.log('=======================\n')

  try {
    const { data: users } = await supabase.auth.admin.listUsers()
    const { data: universes } = await supabase.from('universes').select('*')
    const { data: contentItems } = await supabase.from('content_items').select('*')

    // User engagement levels
    const userEngagement = users.users.map(user => {
      const userUniverses = universes?.filter(u => u.user_id === user.id) || []
      const userContent = contentItems?.filter(c => 
        userUniverses.some(u => u.id === c.universe_id)
      ) || []

      return {
        email: user.email,
        userId: user.id,
        universes: userUniverses.length,
        content: userContent.length,
        lastSignIn: user.last_sign_in_at,
        createdAt: user.created_at
      }
    })

    // Engagement categories
    const highEngagement = userEngagement.filter(u => u.universes >= 3 || u.content >= 10)
    const mediumEngagement = userEngagement.filter(u => (u.universes >= 1 || u.content >= 1) && !highEngagement.includes(u))
    const lowEngagement = userEngagement.filter(u => u.universes === 0 && u.content === 0)

    console.log('📈 User Engagement Levels:')
    console.log(`   High Engagement: ${highEngagement.length} users (3+ universes or 10+ content)`)
    console.log(`   Medium Engagement: ${mediumEngagement.length} users (some content)`)
    console.log(`   Low Engagement: ${lowEngagement.length} users (no content)`)

    if (highEngagement.length > 0) {
      console.log('\n🌟 Most Engaged Users:')
      highEngagement
        .sort((a, b) => (b.universes + b.content) - (a.universes + a.content))
        .slice(0, 5)
        .forEach(user => {
          console.log(`   ${user.email}: ${user.universes} universes, ${user.content} content items`)
        })
    }

    // Recent activity
    const recentlyActive = userEngagement.filter(u => {
      if (!u.lastSignIn) return false
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return new Date(u.lastSignIn) > weekAgo
    })

    console.log(`\n⏰ Recent Activity (7 days): ${recentlyActive.length} users`)

    // User retention analysis
    const now = new Date()
    const usersByAge = userEngagement.map(u => {
      const createdDate = new Date(u.createdAt)
      const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
      return { ...u, ageInDays }
    })

    const newUsers = usersByAge.filter(u => u.ageInDays <= 7)
    const weekOldUsers = usersByAge.filter(u => u.ageInDays > 7 && u.ageInDays <= 30)
    const monthOldUsers = usersByAge.filter(u => u.ageInDays > 30)

    console.log('\n👶 User Cohorts:')
    console.log(`   New (≤7 days): ${newUsers.length} users`)
    console.log(`   Week-old (8-30 days): ${weekOldUsers.length} users`)
    console.log(`   Month+ old (>30 days): ${monthOldUsers.length} users`)

  } catch (error) {
    console.error('❌ Error generating user report:', error.message)
  }
}

async function generateHealthCheck() {
  console.log('🏥 System Health Check')
  console.log('=====================\n')

  try {
    // Check for orphaned data
    const { data: contentItems } = await supabase
      .from('content_items')
      .select('id, universe_id')

    const { data: contentVersions } = await supabase
      .from('content_versions')
      .select('id, content_item_id')

    const { data: universes } = await supabase
      .from('universes')
      .select('id, user_id')

    const { data: users } = await supabase.auth.admin.listUsers()
    const userIds = new Set(users.users.map(u => u.id))

    // Check for orphaned universes
    const orphanedUniverses = universes?.filter(u => !userIds.has(u.user_id)) || []
    
    // Check for orphaned content items
    const universeIds = new Set(universes?.map(u => u.id) || [])
    const orphanedContent = contentItems?.filter(c => !universeIds.has(c.universe_id)) || []

    // Check for orphaned content versions
    const contentItemIds = new Set(contentItems?.map(c => c.id) || [])
    const orphanedVersions = contentVersions?.filter(v => !contentItemIds.has(v.content_item_id)) || []

    console.log('🔍 Data Integrity Check:')
    console.log(`   Orphaned Universes: ${orphanedUniverses.length}`)
    console.log(`   Orphaned Content Items: ${orphanedContent.length}`)
    console.log(`   Orphaned Content Versions: ${orphanedVersions.length}`)

    if (orphanedUniverses.length > 0 || orphanedContent.length > 0 || orphanedVersions.length > 0) {
      console.log('\n⚠️  Data integrity issues found!')
      console.log('   Consider running cleanup script')
    } else {
      console.log('\n✅ Data integrity looks good!')
    }

    // Performance indicators
    console.log('\n📊 Performance Indicators:')
    console.log(`   Total Records: ${(universes?.length || 0) + (contentItems?.length || 0) + (contentVersions?.length || 0)}`)
    console.log(`   Avg Content/Universe: ${universes?.length ? ((contentItems?.length || 0) / universes.length).toFixed(1) : 0}`)
    console.log(`   Avg Versions/Content: ${contentItems?.length ? ((contentVersions?.length || 0) / contentItems.length).toFixed(1) : 0}`)

  } catch (error) {
    console.error('❌ Error running health check:', error.message)
  }
}

async function main() {
  console.log('📈 CanonCore Analytics')
  console.log('======================\n')

  try {
    switch (reportType) {
      case 'overview':
        await generateOverview()
        break
      case 'content':
        await generateContentReport()
        break
      case 'users':
        await generateUserReport()
        break
      case 'health':
        await generateHealthCheck()
        break
      default:
        console.log('Usage: npm run analytics [report-type]')
        console.log('')
        console.log('Report Types:')
        console.log('  overview    Platform overview (default)')
        console.log('  content     Content analysis report')
        console.log('  users       User behavior report')
        console.log('  health      System health check')
        console.log('')
        console.log('Examples:')
        console.log('  npm run analytics')
        console.log('  npm run analytics content')
        console.log('  npm run analytics users')
        return
    }

    console.log('\n✅ Analytics complete!')

  } catch (error) {
    console.error('❌ Analytics failed:', error.message)
  }
}

main().catch(console.error)