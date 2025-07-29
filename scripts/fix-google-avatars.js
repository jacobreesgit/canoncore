#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://reqrehxqjirnfcnrkqja.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJlaHhxamlybmZjbnJrcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3NjAsImV4cCI6MjA2ODg0MDc2MH0.ll70wlFUrBkgd_Lp53govTVBr3wNUSXbe6Vo8ttlkow'

async function copyGoogleAvatar(userId, googleAvatarUrl) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log(`🔄 Copying Google avatar for user ${userId}...`)

    // Fetch the image from Google
    const response = await fetch(googleAvatarUrl)
    if (!response.ok) {
      console.error(`❌ Failed to fetch Google avatar: ${response.status}`)
      return null
    }

    const blob = await response.blob()
    
    // Create unique filename
    const fileName = `google-${userId}-${Date.now()}.jpg`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ Failed to upload avatar:`, uploadError)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const finalUrl = `${publicUrl}?t=${Date.now()}`
    console.log(`✅ Successfully copied avatar: ${finalUrl}`)
    return finalUrl

  } catch (error) {
    console.error(`❌ Error copying Google avatar:`, error)
    return null
  }
}

async function fixGoogleAvatars() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log('🔍 Finding users with Google avatar URLs...')
    
    // Get all profiles with Google avatar URLs
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .like('avatar_url', '%googleusercontent.com%')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }
    
    console.log(`📊 Found ${profiles.length} profiles with Google avatars to fix:\n`)
    
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i]
      console.log(`${i + 1}/${profiles.length}: ${profile.full_name || profile.username} (@${profile.username})`)
      
      // Copy the Google avatar to our storage
      const copiedAvatarUrl = await copyGoogleAvatar(profile.id, profile.avatar_url)
      
      if (copiedAvatarUrl) {
        // Update the profile with the new URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: copiedAvatarUrl })
          .eq('id', profile.id)
          
        if (updateError) {
          console.error(`❌ Failed to update profile:`, updateError)
        } else {
          console.log(`✅ Updated profile avatar URL`)
        }
      } else {
        console.log(`❌ Failed to copy avatar, keeping original URL`)
      }
      
      console.log('') // Empty line for spacing
      
      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('🎉 Avatar fixing completed!')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

fixGoogleAvatars()