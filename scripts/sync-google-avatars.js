#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://reqrehxqjirnfcnrkqja.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJlaHhxamlybmZjbnJrcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3NjAsImV4cCI6MjA2ODg0MDc2MH0.ll70wlFUrBkgd_Lp53govTVBr3wNUSXbe6Vo8ttlkow'

async function syncGoogleAvatars() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log('🔄 Running Google avatar sync function...')
    
    // Run the sync function
    const { data, error } = await supabase.rpc('sync_existing_google_avatars')
    
    if (error) {
      console.error('❌ Error running sync function:', error)
      return
    }
    
    console.log('✅ Google avatar sync completed successfully')
    
    // Query to check results
    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .not('avatar_url', 'is', null)
    
    if (queryError) {
      console.error('❌ Error querying profiles:', queryError)
      return
    }
    
    console.log(`📊 Found ${profiles.length} profiles with avatars:`)
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name || profile.username}: ${profile.avatar_url ? '✅ Has avatar' : '❌ No avatar'}`)
    })
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

syncGoogleAvatars()