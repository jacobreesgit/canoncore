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

const sampleOrganisationTypes = [
  { name: 'Movie' },
  { name: 'TV Show' },
  { name: 'Comic' },
  { name: 'Game' },
  { name: 'Novel' }
]

// Custom relationship types per universe
const customRelationshipTypes = {
  'star-wars-extended': [
    { name: 'Chronological Order', description: 'Events that occur in Star Wars timeline order' },
    { name: 'Character Focus', description: 'Content that shares main characters' },
    { name: 'Era Connection', description: 'Content from the same Star Wars era (Republic, Empire, etc.)' }
  ],
  'marvel-cinematic-universe': [
    { name: 'Phase Connection', description: 'Content from the same MCU phase' },
    { name: 'Multiverse Link', description: 'Cross-dimensional or alternate universe connections' },
    { name: 'Team Assembly', description: 'Content that builds towards team formation' }
  ],
  'lord-of-the-rings': [
    { name: 'Age of Middle-earth', description: 'Content from the same age of Middle-earth history' },
    { name: 'Geographic Connection', description: 'Events occurring in the same locations' },
    { name: 'Adaptation Variant', description: 'Different adaptations of the same source material' }
  ]
}

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
  
  const demoEmail = 'demo@gmail.com'
  
  // First, try to find and delete existing demo user
  console.log('  🔍 Checking for existing demo user...')
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message)
    return null
  }
  
  const existingDemoUser = existingUsers.users.find(user => user.email === demoEmail)
  
  if (existingDemoUser) {
    console.log('  🗑️  Deleting existing demo user...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingDemoUser.id)
    
    if (deleteError) {
      console.error('❌ Error deleting existing demo user:', deleteError.message)
      return null
    }
    
    console.log('  ✅ Existing demo user deleted')
  }
  
  // Create new demo user
  console.log('  ➕ Creating new demo user...')
  const { data, error } = await supabase.auth.admin.createUser({
    email: demoEmail,
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
    const { error: versionError } = await supabase
      .from('universe_versions')
      .insert({
        universe_id: data.id,
        version_name: 'v1',
        version_number: 1,
        commit_message: 'Universe created',
        is_current: true
      })
      
    if (versionError) {
      console.error(`Failed to create initial version for ${data.name}:`, versionError.message)
    }
  }

  return universes
}

async function seedCustomOrganisationTypes(universes, userId) {
  console.log('🏷️  Seeding custom organisation types...')
  
  if (universes.length === 0) {
    console.log('   ⚠️  No universes available, skipping custom organisation types')
    return
  }
  
  for (const universe of universes) {
    // Add 2-3 custom organisation types per universe
    const typesToAdd = sampleOrganisationTypes.slice(0, Math.floor(Math.random() * 3) + 2)
    
    for (const organisationType of typesToAdd) {
      const { error } = await supabase
        .from('custom_organisation_types')
        .insert({
          ...organisationType,
          universe_id: universe.id,
          user_id: userId  // Required field according to schema
        })

      if (error) {
        console.error(`❌ Error creating organisation type ${organisationType.name}:`, error.message)
      } else {
        console.log(`  ✅ Added organisation type "${organisationType.name}" to ${universe.name}`)
      }
    }
  }
}

async function seedCustomRelationshipTypes(universes, userId) {
  console.log('🔗 Seeding custom relationship types...')
  
  if (universes.length === 0) {
    console.log('   ⚠️  No universes available, skipping custom relationship types')
    return {}
  }
  
  const createdCustomTypes = {}
  
  for (const universe of universes) {
    const typesToAdd = customRelationshipTypes[universe.slug] || []
    createdCustomTypes[universe.slug] = []
    
    console.log(`  🌟 Adding custom relationship types for ${universe.name}...`)
    
    for (const relationshipType of typesToAdd) {
      const { data, error } = await supabase
        .from('custom_relationship_types')
        .insert({
          ...relationshipType,
          universe_id: universe.id,
          user_id: userId
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error creating relationship type ${relationshipType.name}:`, error)
      } else {
        console.log(`    ✅ Added relationship type "${relationshipType.name}" (ID: ${data.id})`)
        createdCustomTypes[universe.slug].push(data)
      }
    }
    
    console.log(`    📊 Created ${createdCustomTypes[universe.slug].length} custom types for ${universe.name}`)
  }
  
  return createdCustomTypes
}

async function seedContent(universes) {
  console.log('📚 Seeding content items...')
  
  if (universes.length === 0) {
    console.log('   ⚠️  No universes available, skipping content items')
    return []
  }
  
  const createdContent = []
  
  for (const universe of universes) {
    const contentItems = sampleContent[universe.slug] || []
    const universeContent = []
    
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
      universeContent.push(contentItem)

      // Create a version for each content item
      await supabase
        .from('content_versions')
        .insert({
          content_item_id: contentItem.id,
          version_name: contentData.title,  // Use 'version_name' based on schema
          is_primary: true
        })
    }
    
    createdContent.push({
      universe,
      content: universeContent
    })
  }
  
  return createdContent
}

// Predefined relationship patterns for realistic data (mix of built-in and custom types)
const relationshipPatterns = {
  'star-wars-extended': [
    { from: 'A New Hope', to: 'The Empire Strikes Back', type: 'sequel' },
    { from: 'The Empire Strikes Back', to: 'Return of the Jedi', type: 'sequel' },
    { from: 'Return of the Jedi', to: 'The Mandalorian', type: 'spinoff', description: 'Set after the original trilogy' },
    { from: 'A New Hope', to: 'Thrawn Trilogy', type: 'reference', description: 'Books reference events from the movies' },
    // Custom relationship types (will be resolved from created custom types)
    { from: 'A New Hope', to: 'The Empire Strikes Back', customType: 'Chronological Order', description: 'Occurs immediately after in timeline' },
    { from: 'The Mandalorian', to: 'Return of the Jedi', customType: 'Era Connection', description: 'Both set during Imperial era' }
  ],
  'marvel-cinematic-universe': [
    { from: 'Iron Man', to: 'The Avengers', type: 'sequel', description: 'Tony Stark joins the Avengers initiative' },
    { from: 'The Avengers', to: 'WandaVision', type: 'spinoff', description: 'Explores Wanda after Endgame events' },
    { from: 'Spider-Man: Into the Spider-Verse', to: 'Iron Man', type: 'related', description: 'Multiverse connections' },
    // Custom relationship types
    { from: 'Iron Man', to: 'The Avengers', customType: 'Team Assembly', description: 'Building towards Avengers formation' },
    { from: 'Spider-Man: Into the Spider-Verse', to: 'WandaVision', customType: 'Multiverse Link', description: 'Both explore alternate realities' }
  ],
  'lord-of-the-rings': [
    { from: 'The Hobbit', to: 'The Fellowship of the Ring', type: 'sequel', description: '60 years later' },
    { from: 'The Fellowship of the Ring', to: 'The Two Towers', type: 'sequel' },
    { from: 'The Two Towers', to: 'The Return of the King', type: 'sequel' },
    // Custom relationship types
    { from: 'The Hobbit', to: 'The Fellowship of the Ring', customType: 'Age of Middle-earth', description: 'Both occur during the Third Age' },
    { from: 'The Fellowship of the Ring', to: 'The Two Towers', customType: 'Geographic Connection', description: 'Journey continues through Middle-earth' }
  ]
}

async function seedRelationships(createdContent, customTypes) {
  console.log('🔗 Seeding content relationships...')
  
  if (!createdContent || createdContent.length === 0) {
    console.log('   ⚠️  No content available, skipping relationships')
    return
  }
  
  let totalRelationships = 0
  
  for (const { universe, content } of createdContent) {
    const patterns = relationshipPatterns[universe.slug] || []
    const contentMap = new Map(content.map(item => [item.title, item]))
    const universeCustomTypes = customTypes[universe.slug] || []
    const customTypeMap = new Map(universeCustomTypes.map(type => [type.name, type.id]))
    
    console.log(`  🌟 Creating relationships for ${universe.name}...`)
    
    for (const pattern of patterns) {
      const fromItem = contentMap.get(pattern.from)
      const toItem = contentMap.get(pattern.to)
      
      if (!fromItem || !toItem) {
        console.log(`    ⚠️  Skipping relationship: ${pattern.from} -> ${pattern.to} (items not found)`)
        continue
      }
      
      let linkType = pattern.type
      
      // Handle custom relationship types
      if (pattern.customType) {
        const customTypeId = customTypeMap.get(pattern.customType)
        if (customTypeId) {
          linkType = customTypeId
        } else {
          console.log(`    ⚠️  Custom type "${pattern.customType}" not found, skipping relationship`)
          continue
        }
      }
      
      // Create the primary relationship
      const { data: primaryLink, error: primaryError } = await supabase
        .from('content_links')
        .insert({
          from_item_id: fromItem.id,
          to_item_id: toItem.id,
          link_type: linkType,
          description: pattern.description || null
        })
        .select()
        .single()

      if (primaryError) {
        console.error(`    ❌ Error creating relationship ${pattern.from} -> ${pattern.to}:`, primaryError.message)
        continue
      }

      const displayType = pattern.customType || pattern.type
      console.log(`    ✅ Created ${displayType}: ${pattern.from} -> ${pattern.to}`)
      totalRelationships++
    }
    
    // Add some random additional relationships for variety
    if (content.length > 3) {
      const randomRelationshipTypes = ['reference', 'related']
      const numRandomRelationships = Math.floor(Math.random() * 3) + 1
      
      for (let i = 0; i < numRandomRelationships; i++) {
        const fromItem = content[Math.floor(Math.random() * content.length)]
        const toItem = content[Math.floor(Math.random() * content.length)]
        
        if (fromItem.id === toItem.id) continue // Skip self-references
        
        const randomType = randomRelationshipTypes[Math.floor(Math.random() * randomRelationshipTypes.length)]
        
        // Check if relationship already exists
        const { data: existingLink } = await supabase
          .from('content_links')
          .select('id')
          .eq('from_item_id', fromItem.id)
          .eq('to_item_id', toItem.id)
          .eq('link_type', randomType)
          .single()

        if (existingLink) continue // Skip if already exists
        
        const { error: randomError } = await supabase
          .from('content_links')
          .insert({
            from_item_id: fromItem.id,
            to_item_id: toItem.id,
            link_type: randomType,
            description: `Random ${randomType} relationship for testing`
          })

        if (!randomError) {
          console.log(`    ✅ Created random ${randomType}: ${fromItem.title} -> ${toItem.title}`)
          totalRelationships++
        }
      }
    }
  }
  
  console.log(`  🎯 Created ${totalRelationships} total relationships`)
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
    await seedCustomOrganisationTypes(universes, userId)
    const customRelationshipTypes = await seedCustomRelationshipTypes(universes, userId)
    const createdContent = await seedContent(universes)
    await seedRelationships(createdContent, customRelationshipTypes)

    console.log('\n✅ Seeding complete!')
    console.log(`Created ${universes.length} universes with sample content and relationships`)
    console.log('Demo user: demo@gmail.com (password: demo123456)')

  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
  }
}

main().catch(console.error)