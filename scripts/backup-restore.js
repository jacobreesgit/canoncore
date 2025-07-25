#!/usr/bin/env node

/**
 * Database Backup & Restore Script
 * 
 * Creates and restores database backups for development and deployment.
 * Supports full database dumps and selective data exports.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const args = process.argv.slice(2)
const command = args[0]
const backupName = args[1] || `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`

const BACKUP_DIR = path.join(process.cwd(), 'backups')

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  } catch (error) {
    console.error('❌ Error creating backup directory:', error.message)
    process.exit(1)
  }
}

async function createBackup() {
  console.log('💾 Creating database backup...')
  console.log(`   Backup name: ${backupName}`)
  
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    data: {}
  }

  try {
    // Backup users
    console.log('   📥 Backing up users...')
    const { data: users } = await supabase.auth.admin.listUsers()
    backup.data.users = users.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata
    }))

    // Backup universes
    console.log('   📥 Backing up universes...')
    const { data: universes } = await supabase
      .from('universes')
      .select('*')
    backup.data.universes = universes

    // Backup universe versions
    console.log('   📥 Backing up universe versions...')
    const { data: universeVersions } = await supabase
      .from('universe_versions')
      .select('*')
    backup.data.universe_versions = universeVersions

    // Backup content items
    console.log('   📥 Backing up content items...')
    const { data: contentItems } = await supabase
      .from('content_items')
      .select('*')
    backup.data.content_items = contentItems

    // Backup content versions
    console.log('   📥 Backing up content versions...')
    const { data: contentVersions } = await supabase
      .from('content_versions')
      .select('*')
    backup.data.content_versions = contentVersions

    // Backup custom content types
    console.log('   📥 Backing up custom content types...')
    const { data: customTypes } = await supabase
      .from('custom_content_types')
      .select('*')
    backup.data.custom_content_types = customTypes

    // Backup disabled content types
    console.log('   📥 Backing up disabled content types...')
    const { data: disabledTypes } = await supabase
      .from('disabled_content_types')
      .select('*')
    backup.data.disabled_content_types = disabledTypes

    // Save backup to file
    const backupPath = path.join(BACKUP_DIR, `${backupName}.json`)
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2))

    console.log(`✅ Backup created successfully!`)
    console.log(`   📁 File: ${backupPath}`)
    console.log(`   📊 Users: ${backup.data.users.length}`)
    console.log(`   📊 Universes: ${backup.data.universes?.length || 0}`)
    console.log(`   📊 Content Items: ${backup.data.content_items?.length || 0}`)

  } catch (error) {
    console.error('❌ Backup failed:', error.message)
  }
}

async function listBackups() {
  console.log('📋 Available backups:')
  
  try {
    const files = await fs.readdir(BACKUP_DIR)
    const backupFiles = files.filter(f => f.endsWith('.json'))
    
    if (backupFiles.length === 0) {
      console.log('   No backups found')
      return
    }

    for (const file of backupFiles) {
      const filePath = path.join(BACKUP_DIR, file)
      const stats = await fs.stat(filePath)
      const content = await fs.readFile(filePath, 'utf8')
      
      try {
        const backup = JSON.parse(content)
        console.log(`   📁 ${file}`)
        console.log(`      Created: ${backup.timestamp}`)
        console.log(`      Size: ${(stats.size / 1024).toFixed(1)} KB`)
        console.log(`      Users: ${backup.data.users?.length || 0}`)
        console.log(`      Universes: ${backup.data.universes?.length || 0}`)
        console.log('')
      } catch {
        console.log(`   📁 ${file} (corrupted)`)
      }
    }
  } catch (error) {
    console.error('❌ Error listing backups:', error.message)
  }
}

async function restoreBackup() {
  console.log(`🔄 Restoring backup: ${backupName}`)
  
  try {
    const backupPath = path.join(BACKUP_DIR, `${backupName}.json`)
    const content = await fs.readFile(backupPath, 'utf8')
    const backup = JSON.parse(content)

    console.log(`   📅 Backup from: ${backup.timestamp}`)
    console.log('   ⚠️  This will overwrite existing data!')
    
    // Note: Full restore is complex and dangerous
    // For now, just show what would be restored
    console.log('\n📊 Backup contents:')
    console.log(`   Users: ${backup.data.users?.length || 0}`)
    console.log(`   Universes: ${backup.data.universes?.length || 0}`)
    console.log(`   Content Items: ${backup.data.content_items?.length || 0}`)
    console.log(`   Content Versions: ${backup.data.content_versions?.length || 0}`)
    
    console.log('\n⚠️  Full restore not implemented for safety')
    console.log('   Use this backup file for manual data recovery')

  } catch (error) {
    console.error('❌ Restore failed:', error.message)
  }
}

async function exportUserData() {
  const userId = args[1]
  if (!userId) {
    console.error('❌ Error: User ID required for export')
    console.log('Usage: npm run backup-restore export-user <user-id>')
    return
  }

  console.log(`📤 Exporting data for user: ${userId}`)
  
  try {
    // Get user info
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    if (!userData.user) {
      console.error('❌ User not found')
      return
    }

    const export_data = {
      timestamp: new Date().toISOString(),
      user: {
        id: userData.user.id,
        email: userData.user.email,
        user_metadata: userData.user.user_metadata
      },
      data: {}
    }

    // Export user's universes
    const { data: universes } = await supabase
      .from('universes')
      .select('*')
      .eq('user_id', userId)
    export_data.data.universes = universes

    if (universes && universes.length > 0) {
      const universeIds = universes.map(u => u.id)

      // Export content items
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('*')
        .in('universe_id', universeIds)
      export_data.data.content_items = contentItems

      // Export other related data...
    }

    const exportPath = path.join(BACKUP_DIR, `user_${userId}_${Date.now()}.json`)
    await fs.writeFile(exportPath, JSON.stringify(export_data, null, 2))

    console.log(`✅ User data exported to: ${exportPath}`)
    console.log(`📊 Universes: ${export_data.data.universes?.length || 0}`)

  } catch (error) {
    console.error('❌ Export failed:', error.message)
  }
}

async function main() {
  console.log('💾 CanonCore Backup & Restore')
  console.log('==============================\n')

  await ensureBackupDir()

  try {
    switch (command) {
      case 'create':
      case 'backup':
        await createBackup()
        break
      case 'list':
        await listBackups()
        break
      case 'restore':
        if (!args[1]) {
          console.error('❌ Error: Backup name required')
          console.log('Usage: npm run backup-restore restore <backup-name>')
          return
        }
        await restoreBackup()
        break
      case 'export-user':
        await exportUserData()
        break
      default:
        console.log('Usage: npm run backup-restore <command> [options]')
        console.log('')
        console.log('Commands:')
        console.log('  create [name]        Create a full database backup')
        console.log('  list                 List available backups')
        console.log('  restore <name>       Restore from backup (read-only)')
        console.log('  export-user <id>     Export specific user data')
        console.log('')
        console.log('Examples:')
        console.log('  npm run backup-restore create my-backup')
        console.log('  npm run backup-restore list')
        console.log('  npm run backup-restore export-user 123e4567-e89b-12d3-a456-426614174000')
        return
    }

  } catch (error) {
    console.error('❌ Operation failed:', error.message)
  }
}

main().catch(console.error)