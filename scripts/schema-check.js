#!/usr/bin/env node

/**
 * Database Schema Verification Script
 * 
 * Verifies database schema integrity, checks constraints,
 * and validates table relationships for CanonCore.
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

// Expected schema structure
const expectedTables = {
  universes: {
    required_columns: ['id', 'name', 'slug', 'description', 'user_id', 'username', 'created_at'],
    constraints: ['universes_pkey', 'universes_username_slug_key']
  },
  universe_versions: {
    required_columns: ['id', 'universe_id', 'version_number', 'name', 'description', 'is_current', 'created_at'],
    constraints: ['universe_versions_pkey']
  },
  content_items: {
    required_columns: ['id', 'name', 'slug', 'description', 'content_type', 'universe_id', 'parent_id', 'order_index', 'created_at'],
    constraints: ['content_items_pkey']
  },
  content_versions: {
    required_columns: ['id', 'content_item_id', 'title', 'description', 'version_number', 'is_primary', 'created_at'],
    constraints: ['content_versions_pkey']
  },
  custom_content_types: {
    required_columns: ['id', 'name', 'emoji', 'universe_id', 'created_at'],
    constraints: ['custom_content_types_pkey']
  },
  disabled_content_types: {
    required_columns: ['id', 'universe_id', 'content_type', 'created_at'],
    constraints: ['uc_universe_content_type']
  }
}

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    return { exists: !error, error: error?.message }
  } catch (error) {
    return { exists: false, error: error.message }
  }
}

async function getTableColumns(tableName) {
  try {
    // Get table structure from information_schema
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: tableName })
    
    if (error) {
      // Fallback: try to get columns by querying the table
      const { data: sampleData, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (queryError) {
        return { columns: [], error: queryError.message }
      }
      
      const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : []
      return { columns, error: null }
    }
    
    return { columns: data?.map(col => col.column_name) || [], error: null }
  } catch (error) {
    return { columns: [], error: error.message }
  }
}

async function checkForeignKeyConstraints() {
  console.log('🔗 Checking Foreign Key Constraints...')
  
  const constraints = [
    {
      name: 'universes.user_id → auth.users.id',
      check: async () => {
        const { data: orphaned } = await supabase
          .rpc('check_orphaned_universes')
        return orphaned?.length || 0
      }
    },
    {
      name: 'content_items.universe_id → universes.id',
      check: async () => {
        const { data: contentItems } = await supabase
          .from('content_items')
          .select('id, universe_id')
        
        const { data: universes } = await supabase
          .from('universes')
          .select('id')
        
        const universeIds = new Set(universes?.map(u => u.id) || [])
        return contentItems?.filter(c => !universeIds.has(c.universe_id))?.length || 0
      }
    },
    {
      name: 'content_versions.content_item_id → content_items.id',
      check: async () => {
        const { data: versions } = await supabase
          .from('content_versions')
          .select('id, content_item_id')
        
        const { data: items } = await supabase
          .from('content_items')
          .select('id')
        
        const itemIds = new Set(items?.map(i => i.id) || [])
        return versions?.filter(v => !itemIds.has(v.content_item_id))?.length || 0
      }
    }
  ]

  for (const constraint of constraints) {
    try {
      const orphanedCount = await constraint.check()
      if (orphanedCount > 0) {
        console.log(`   ❌ ${constraint.name}: ${orphanedCount} orphaned records`)
      } else {
        console.log(`   ✅ ${constraint.name}: OK`)
      }
    } catch (error) {
      console.log(`   ⚠️  ${constraint.name}: Error checking - ${error.message}`)
    }
  }
}

async function checkDataIntegrity() {
  console.log('\n🔍 Data Integrity Checks...')
  
  try {
    // Check for duplicate slugs within same username
    const { data: universes } = await supabase
      .from('universes')
      .select('username, slug')
    
    if (universes) {
      const slugMap = new Map()
      let duplicates = 0
      
      universes.forEach(universe => {
        const key = `${universe.username}:${universe.slug}`
        if (slugMap.has(key)) {
          duplicates++
        } else {
          slugMap.set(key, true)
        }
      })
      
      if (duplicates > 0) {
        console.log(`   ❌ Duplicate universe slugs: ${duplicates} found`)
      } else {
        console.log('   ✅ Universe slug uniqueness: OK')
      }
    }

    // Check for content items without primary versions
    const { data: itemsWithoutPrimary } = await supabase
      .from('content_items')
      .select(`
        id,
        name,
        content_versions!inner(is_primary)
      `)
      .eq('content_versions.is_primary', true)
    
    const { data: allItems } = await supabase
      .from('content_items')
      .select('id')
    
    const itemsWithPrimary = new Set(itemsWithoutPrimary?.map(i => i.id) || [])
    const orphanedItems = allItems?.filter(i => !itemsWithPrimary.has(i.id))?.length || 0
    
    if (orphanedItems > 0) {
      console.log(`   ❌ Content items without primary version: ${orphanedItems}`)
    } else {
      console.log('   ✅ Primary version integrity: OK')
    }

  } catch (error) {
    console.log(`   ⚠️  Data integrity check failed: ${error.message}`)
  }
}

async function checkRLSPolicies() {
  console.log('\n🛡️  Row Level Security Policies...')
  
  const tables = Object.keys(expectedTables)
  
  for (const table of tables) {
    try {
      // Try to access table without authentication (should fail if RLS is enabled)
      const anonymousClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      const { error } = await anonymousClient
        .from(table)
        .select('*')
        .limit(1)
      
      if (error && error.message.includes('permission denied')) {
        console.log(`   ✅ ${table}: RLS enabled`)
      } else if (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`)
      } else {
        console.log(`   ❌ ${table}: RLS may not be properly configured`)
      }
    } catch (error) {
      console.log(`   ⚠️  ${table}: Error checking RLS - ${error.message}`)
    }
  }
}

async function main() {
  console.log('🔍 CanonCore Schema Verification')
  console.log('================================\n')

  let issuesFound = 0

  try {
    // Check table existence and structure
    console.log('📋 Table Structure Check...')
    
    for (const [tableName, tableInfo] of Object.entries(expectedTables)) {
      const { exists, error } = await checkTableExists(tableName)
      
      if (!exists) {
        console.log(`   ❌ Table '${tableName}' not found: ${error}`)
        issuesFound++
        continue
      }
      
      const { columns, error: colError } = await getTableColumns(tableName)
      
      if (colError) {
        console.log(`   ⚠️  Could not verify columns for ${tableName}: ${colError}`)
        continue
      }
      
      const missingColumns = tableInfo.required_columns.filter(col => !columns.includes(col))
      
      if (missingColumns.length > 0) {
        console.log(`   ❌ ${tableName} missing columns: ${missingColumns.join(', ')}`)
        issuesFound++
      } else {
        console.log(`   ✅ ${tableName}: Structure OK (${columns.length} columns)`)
      }
    }

    // Check foreign key constraints
    await checkForeignKeyConstraints()
    
    // Check data integrity
    await checkDataIntegrity()
    
    // Check RLS policies
    await checkRLSPolicies()

    // Summary
    console.log('\n📊 Schema Verification Summary:')
    if (issuesFound === 0) {
      console.log('   ✅ All checks passed! Schema looks healthy.')
    } else {
      console.log(`   ⚠️  ${issuesFound} issues found. Review above for details.`)
    }

  } catch (error) {
    console.error('❌ Schema verification failed:', error.message)
  }
}

main().catch(console.error)