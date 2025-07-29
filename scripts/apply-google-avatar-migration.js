#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://reqrehxqjirnfcnrkqja.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJlaHhxamlybmZjbnJrcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3NjAsImV4cCI6MjA2ODg0MDc2MH0.ll70wlFUrBkgd_Lp53govTVBr3wNUSXbe6Vo8ttlkow'

async function applyMigration() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log('🔄 Applying Google avatar migration...')
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250728000000_sync_google_avatars.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.includes('SELECT public.sync_existing_google_avatars()')) {
        console.log(`🔄 Executing sync function (${i + 1}/${statements.length})...`)
        const { error } = await supabase.rpc('sync_existing_google_avatars')
        if (error) {
          console.error(`❌ Error in sync function:`, error)
        } else {
          console.log(`✅ Sync function completed`)
        }
      } else {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error && !error.message.includes('already exists')) {
          console.error(`❌ Error in statement ${i + 1}:`, error)
        } else {
          console.log(`✅ Statement ${i + 1} completed`)
        }
      }
    }
    
    console.log('✅ Migration application completed')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

applyMigration()