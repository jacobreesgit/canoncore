#!/usr/bin/env node

/**
 * Development Data Seeder
 * 
 * Seeds the database with realistic test data for development.
 * Creates sample users, universes, content items, and versions.
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

// Sample data templates
const sampleUniverses = [
  {
    name: 'Star Wars Extended Universe',
    description: 'Comprehensive collection of Star Wars content across all media',
    slug: 'star-wars-extended'
  },
  {
    name: 'Marvel Cinematic Universe',
    description: 'Complete MCU timeline with movies, shows, and comics',
    slug: 'marvel-cinematic-universe'
  },
  {
    name: 'Lord of the Rings',
    description: 'Middle-earth saga including books, films, and adaptations',
    slug: 'lord-of-the-rings'
  }
]

const sampleContentTypes = [
  { name: 'Movie' },
  { name: 'TV Show' },
  { name: 'Comic' },
  { name: 'Game' },
  { name: 'Novel' }
]

const sampleContent = {
  'star-wars-extended': [
    { title: 'A New Hope', item_type: 'movie', description: 'The original Star Wars film' },
    { title: 'The Empire Strikes Back', item_type: 'movie', description: 'The dark middle chapter' },
    { title: 'Return of the Jedi', item_type: 'movie', description: 'The original trilogy conclusion' },
    { title: 'The Mandalorian', item_type: 'episode', description: 'Disney+ series following a bounty hunter' },
    { title: 'Thrawn Trilogy', item_type: 'novel', description: 'Timothy Zahn\'s legendary book series' }
  ],
  'marvel-cinematic-universe': [
    { title: 'Iron Man', item_type: 'movie', description: 'The film that started it all' },
    { title: 'The Avengers', item_type: 'movie', description: 'Earth\'s Mightiest Heroes assemble' },
    { title: 'WandaVision', item_type: 'episode', description: 'Disney+ series exploring Wanda\'s grief' },
    { title: 'Spider-Man: Into the Spider-Verse', item_type: 'movie', description: 'Animated multiverse adventure' }
  ],
  'lord-of-the-rings': [
    { title: 'The Fellowship of the Ring', item_type: 'novel', description: 'The first volume of LOTR' },
    { title: 'The Two Towers', item_type: 'novel', description: 'The second volume of LOTR' },
    { title: 'The Return of the King', item_type: 'novel', description: 'The final volume of LOTR' },
    { title: 'The Hobbit', item_type: 'novel', description: 'Bilbo\'s unexpected journey' }
  ]
}

async function createDemoUser() {
  console.log('👤 Creating demo user...')
  
  // Use a Gmail address to match the expected trigger pattern
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'demo@gmail.com',
    password: 'demo123456',
    email_confirm: true,
    user_metadata: {
      full_name: 'Demo User'
    }
  })

  if (error) {
    console.error('❌ Error creating demo user:', error.message)
    return null
  }

  console.log('✅ Demo user created:', data.user.email)
  return data.user
}

async function seedUniverses(userId) {
  console.log('🌟 Seeding universes...')
  
  const universes = []
  
  for (const universeData of sampleUniverses) {
    const { data, error } = await supabase
      .from('universes')
      .insert({
        ...universeData,
        user_id: userId
        // username will be populated automatically by the trigger
      })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creating universe ${universeData.name}:`, error.message)
      continue
    }

    console.log(`  ✅ Created universe: ${data.name} (username: ${data.username})`)
    universes.push(data)

    // Create initial universe version
    await supabase
      .from('universe_versions')
      .insert({
        universe_id: data.id,
        version_number: 1,
        name: 'Initial Version',
        description: 'Initial universe setup',
        is_current: true
      })
  }

  return universes
}

async function seedCustomContentTypes(universes, userId) {
  console.log('🏷️  Seeding custom content types...')
  
  if (universes.length === 0) {
    console.log('   ⚠️  No universes available, skipping custom content types')
    return
  }
  
  for (const universe of universes) {
    // Add 2-3 custom content types per universe
    const typesToAdd = sampleContentTypes.slice(0, Math.floor(Math.random() * 3) + 2)
    
    for (const contentType of typesToAdd) {
      const { error } = await supabase
        .from('custom_content_types')
        .insert({
          ...contentType,
          universe_id: universe.id,
          user_id: userId  // Required field according to schema
        })

      if (error) {
        console.error(`❌ Error creating content type ${contentType.name}:`, error.message)
      } else {
        console.log(`  ✅ Added content type "${contentType.name}" to ${universe.name}`)
      }
    }
  }
}

async function seedContent(universes) {
  console.log('📚 Seeding content items...')
  
  if (universes.length === 0) {
    console.log('   ⚠️  No universes available, skipping content items')
    return
  }
  
  for (const universe of universes) {
    const contentItems = sampleContent[universe.slug] || []
    
    for (let i = 0; i < contentItems.length; i++) {
      const contentData = contentItems[i]
      
      const { data: contentItem, error } = await supabase
        .from('content_items')
        .insert({
          title: contentData.title,  // Use 'title' not 'name'
          slug: contentData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: contentData.description,
          item_type: contentData.item_type,  // Use 'item_type' not 'content_type'
          universe_id: universe.id,
          order_index: i
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error creating content ${contentData.title}:`, error.message)
        continue
      }

      console.log(`  ✅ Created content: ${contentItem.title}`)

      // Create a version for each content item
      await supabase
        .from('content_versions')
        .insert({
          content_item_id: contentItem.id,
          version_name: contentData.title,  // Use 'version_name' based on schema
          is_primary: true
        })
    }
  }
}

async function main() {
  console.log('🌱 CanonCore Development Data Seeder')
  console.log('====================================\n')

  try {
    // Check if demo user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const demoUser = existingUsers.users.find(u => u.email === 'demo@canoncore.dev')

    let userId
    if (demoUser) {
      console.log('👤 Demo user already exists, using existing user')
      userId = demoUser.id
    } else {
      const newUser = await createDemoUser()
      if (!newUser) return
      userId = newUser.id
    }

    // Check if data already exists
    const { data: existingUniverses } = await supabase
      .from('universes')
      .select('*')
      .eq('user_id', userId)

    if (existingUniverses && existingUniverses.length > 0) {
      console.log('⚠️  Demo data already exists. Use cleanup script first if you want to reseed.')
      return
    }

    const universes = await seedUniverses(userId)
    await seedCustomContentTypes(universes, userId)
    await seedContent(universes)

    console.log('\n✅ Seeding complete!')
    console.log(`Created ${universes.length} universes with sample content`)
    console.log('Demo user: demo@gmail.com (password: demo123456)')

  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
  }
}

main().catch(console.error)