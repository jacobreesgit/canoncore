# CanonCore Development Scripts

This directory contains useful development and maintenance scripts for the CanonCore platform.

## 📋 Script Execution Order

When setting up or maintaining the CanonCore platform, follow this recommended execution order:

### 🔧 Initial Setup & Verification
```bash
# 1. Verify database schema integrity first
npm run schema-check

# 2. Create initial development data
npm run seed-data

# 3. Verify users and data were created properly
npm run scan-users
```

### 🔄 Regular Development Workflow
```bash
# 1. Clean existing demo data before fresh setup
npm run cleanup-data --demo --dry-run  # Preview first
npm run cleanup-data --demo            # Then execute

# 2. Seed fresh development data
npm run seed-data

# 3. Verify everything is working
npm run scan-users
npm run analytics overview
```

### 🧹 Maintenance & Cleanup
```bash
# 1. Check system health before cleanup
npm run analytics health
npm run schema-check

# 2. Clean up test data (use dry-run first)
npm run cleanup-data --test --dry-run
npm run cleanup-data --test

# 3. Verify cleanup completed successfully
npm run scan-users
```

### 💾 Backup Operations
```bash
# 1. Create backup before major changes
npm run backup-restore create pre-deployment

# 2. List available backups
npm run backup-restore list

# 3. Export specific user data if needed
npm run backup-restore export-user <user-id>
```

⚠️ **Important Notes:**
- Always run `schema-check` before any major operations
- Use `--dry-run` flag with cleanup operations to preview changes
- Create backups before making significant changes
- Verify operations with `scan-users` and `analytics` after completion

---

## 🚀 Available Scripts

### 👥 User Management

#### `npm run scan-users`

Scans all users in the Supabase database and displays detailed information.

**Features:**

- User authentication details (email, creation date, last sign-in)
- User metadata (Google profile info)
- Associated application data (universes, content)
- Summary statistics and analytics

**Example output:**

```
📊 Found 2 users in the database
👤 User 1: jacob@example.com (created 2025-01-25)
📚 Found 3 universes across 2 users
```

---

### 🌱 Data Management

#### `npm run seed-data`

Seeds the database with realistic development data.

**Creates:**

- Demo user account (`demo@gmail.com`)
- Sample universes (Star Wars, Marvel, LOTR)
- Custom organisation types per universe
- Sample content items with versions

**Usage:**

```bash
npm run seed-data
```

**Safe:** Checks for existing data before seeding.

---

#### `npm run cleanup-data [options]`

Safely removes development and test data.

**Options:**

- `--demo` - Clean up demo user data (default)
- `--test` - Clean up test user accounts
- `--dry-run` - Show what would be deleted without deleting

**Examples:**

```bash
npm run cleanup-data --demo
npm run cleanup-data --test --dry-run
npm run cleanup-data --demo
```

---

### 💾 Backup & Restore

#### `npm run backup-restore <command> [options]`

Comprehensive backup and restore functionality.

**Commands:**

- `create [name]` - Create full database backup
- `list` - List available backups
- `restore <name>` - View backup contents (read-only)
- `export-user <id>` - Export specific user data

**Examples:**

```bash
npm run backup-restore create my-backup
npm run backup-restore list
npm run backup-restore export-user 123e4567-e89b-12d3-a456-426614174000
```

**Features:**

- Complete database snapshots
- User-specific data exports
- Metadata and timestamps
- Safe read-only restore preview

---

### 📊 Analytics & Insights

#### `npm run analytics [report-type]`

Generates detailed analytics about platform usage.

**Report Types:**

- `overview` - Platform overview (default)
- `content` - Content analysis report
- `users` - User behavior report
- `health` - System health check

**Examples:**

```bash
npm run analytics
npm run analytics content
npm run analytics users
npm run analytics health
```

**Insights:**

- User engagement levels
- Content creation patterns
- Platform growth metrics
- Data integrity checks

---

### 🔍 Schema Verification

#### `npm run schema-check`

Verifies database schema integrity and constraints.

**Checks:**

- Table structure validation
- Foreign key constraint verification
- Data integrity analysis
- Row Level Security (RLS) policy validation
- Orphaned data detection

**Example output:**

```
✅ universes: Structure OK (8 columns)
✅ content_items.universe_id → universes.id: OK
⚠️  Found 2 orphaned content versions
```

---

## 🛠️ Development Workflow

### Setting Up Development Data

```bash
# 1. Clean existing demo data
npm run cleanup-data --demo

# 2. Seed fresh development data
npm run seed-data

# 3. Verify everything looks good
npm run scan-users
npm run analytics overview
```

### Regular Maintenance

```bash
# Check system health
npm run analytics health
npm run schema-check

# Clean up test data
npm run cleanup-data --test

# Create backup before major changes
npm run backup-restore create pre-deployment
```

### Debugging Issues

```bash
# Check for data integrity issues
npm run analytics health
npm run schema-check

# Analyze user behavior
npm run analytics users

# Export specific user data for inspection
npm run backup-restore export-user <user-id>
```

---

## 🔒 Security Notes

- All scripts use the **service role key** for admin access
- Service role key must be set in `.env.local`
- Scripts bypass Row Level Security (RLS) for administrative tasks
- **Never commit** `.env.local` or expose service keys
- Cleanup scripts include safety checks and dry-run options

---

## 🚨 Safety Features

- **Dry-run modes** for destructive operations
- **Confirmation checks** before major deletions
- **Orphaned data detection** before cleanup
- **Backup verification** before restore operations
- **Schema validation** before data operations

---

## 📁 File Structure

```
scripts/
├── scan-users.js          # User database scanner
├── seed-data.js           # Development data seeder
├── cleanup-data.js        # Data cleanup utility
├── backup-restore.js      # Backup & restore system
├── analytics.js           # Analytics & insights
├── schema-check.js        # Schema verification
└── README.md             # This documentation
```

All scripts are executable and include comprehensive error handling and logging.
