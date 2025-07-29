#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://reqrehxqjirnfcnrkqja.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJlaHhxamlybmZjbnJrcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3NjAsImV4cCI6MjA2ODg0MDc2MH0.ll70wlFUrBkgd_Lp53govTVBr3wNUSXbe6Vo8ttlkow'

async function debugAvatarUrls() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log('🔍 Checking all profiles with avatars...')
    
    // Get all profiles with avatar URLs
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .not('avatar_url', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }
    
    console.log(`📊 Found ${profiles.length} profiles with avatars:\n`)
    
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name || profile.username || 'Unnamed'} (@${profile.username})`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Avatar URL: ${profile.avatar_url}`)
      console.log(`   URL Length: ${profile.avatar_url?.length || 0} chars`)
      
      // Check if it's a Google avatar
      if (profile.avatar_url?.includes('googleusercontent.com')) {
        console.log(`   ✅ Google Avatar detected`)
        
        // Extract the image ID and parameters
        const match = profile.avatar_url.match(/\/a\/([^=]+)(=.*)?$/)
        if (match) {
          console.log(`   Image ID: ${match[1]}`)
          console.log(`   Parameters: ${match[2] || 'none'}`)
        }
      } else {
        console.log(`   ⚠️  Non-Google Avatar`)
      }
      
      console.log('') // Empty line for spacing
    })
    
    // Also check public universes to see what data is returned
    console.log('🌍 Checking public universes data...')
    
    const { data: universes, error: universesError } = await supabase
      .from('universes')
      .select(`
        id,
        name,
        user_id,
        username,
        profiles:user_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .limit(5)
    
    if (universesError) {
      console.error('❌ Error fetching universes:', universesError)
      return
    }
    
    console.log(`📊 Found ${universes.length} public universes:\n`)
    
    universes.forEach((universe, index) => {
      console.log(`${index + 1}. ${universe.name}`)
      console.log(`   Universe User ID: ${universe.user_id}`)
      console.log(`   Profile Data:`, universe.profiles)
      console.log('') // Empty line for spacing
    })
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

debugAvatarUrls()