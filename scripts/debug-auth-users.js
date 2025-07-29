#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://reqrehxqjirnfcnrkqja.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJlaHhxamlybmZjbnJrcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3NjAsImV4cCI6MjA2ODg0MDc2MH0.ll70wlFUrBkgd_Lp53govTVBr3wNUSXbe6Vo8ttlkow'

async function debugAuthUsers() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log('🔍 Checking current user and profile data...')
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Error getting user:', userError)
      console.log('ℹ️  No authenticated user found - this is expected when running as script')
      return
    }
    
    if (user) {
      console.log('✅ Current user found:')
      console.log(`  - ID: ${user.id}`)
      console.log(`  - Email: ${user.email}`)
      console.log(`  - Provider: ${user.app_metadata?.provider}`)
      console.log(`  - User metadata:`, JSON.stringify(user.user_metadata, null, 2))
      console.log(`  - Raw user metadata:`, JSON.stringify(user.raw_user_meta_data || user.user_metadata, null, 2))
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (profileError) {
        console.log('❌ Error getting profile:', profileError)
      } else {
        console.log('✅ Profile found:')
        console.log(`  - Full name: ${profile.full_name}`)
        console.log(`  - Username: ${profile.username}`)
        console.log(`  - Avatar URL: ${profile.avatar_url}`)
      }
    }
    
    // Query all profiles to see current state
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (profilesError) {
      console.log('❌ Error getting profiles:', profilesError)
    } else {
      console.log(`\n📊 Recent profiles (${allProfiles.length}):`)
      allProfiles.forEach(profile => {
        console.log(`  - ${profile.full_name || profile.username || 'Unnamed'}: ${profile.avatar_url ? '✅ Has avatar' : '❌ No avatar'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

debugAuthUsers()