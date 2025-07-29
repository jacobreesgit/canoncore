# CLAUDE.md

## CanonCore Implementation Brief

**Modern content organisation platform for expanded universes using Next.js, Supabase, TypeScript.**

### Key Requirements

- Production-ready code (no TODOs, placeholders, unused imports)
- British English throughout
- Google Auth via Supabase (configured)
- Automated SQL migrations via Supabase CLI

### Supabase Config

- **URL**: https://reqrehxqjirnfcnrkqja.supabase.co
- **API Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJlaHhxamlybmZjbnJrcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3NjAsImV4cCI6MjA2ODg0MDc2MH0.ll70wlFUrBkgd_Lp53govTVBr3wNUSXbe6Vo8ttlkow
- **DB Password**: UiPaGSGsKCw5LGh

### Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Next.js linting

### Development Scripts

- `npm run scan-users` - Scan all Supabase users with detailed analytics
- `npm run scan-universes [universe] [--detailed]` - Analyze universe structure and content
- `npm run seed-data` - Populate database with realistic development data
- `npm run cleanup-data [--demo|--test] [--dry-run]` - Clean up development/test data
- `npm run backup-restore <command>` - Database backup and restore operations
- `npm run analytics [report-type]` - Generate platform usage analytics
- `npm run schema-check` - Verify database schema integrity and constraints

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth + RLS)
- **React Query** (server state) + **Zustand** (client state)
- **Route**: `/:username/:slug` with hierarchical tree view

## UI Component System

### ✅ Standardized Form Components

**Input Component** (`/components/ui/forms/input.tsx`)
- Support for text, email, url, number, password input types
- Consistent styling with focus states (focus:ring-blue-500 focus:border-blue-500)
- TypeScript interface extending HTMLInputElement with forwardRef support
- Label, error, and help text props
- Prefix/suffix icon support with password visibility toggle
- Size variants (sm, md, lg) matching ActionButton
- Disabled and loading states

**Textarea Component** (`/components/ui/forms/textarea.tsx`)
- Extends HTMLTextAreaElement props with consistent Input styling
- Auto-resize functionality with configurable min/max rows
- Character count display with max length validation
- Resize handle control (none, vertical, both)
- Same error handling and styling patterns as Input component
- Loading states and disabled support

**Form Error Standardization** (`/hooks/use-form-error.ts`, `/components/ui/forms/error-display.tsx`)
- Centralized form error management with comprehensive error parsing
- Standardized error display components with multiple variants (inline, card, banner)
- Built-in field validators (required, email, URL, password strength, etc.)
- Toast notification integration and retry logic
- Consistent error handling patterns across all forms

**Form System Integration**
- FormModal component uses standardized Input and Textarea components
- All hardcoded input/textarea elements replaced throughout codebase
- EditProfileModal and AuthForm updated with standardized error handling
- British English throughout form labels and messages

### ✅ Profile Management System

**Profile Components** (`/components/profile/`)
- **EditProfileModal** - Complete profile editing with avatar upload
- **AvatarUpload** - Drag & drop avatar upload with preview and validation
- Profile hooks (`/hooks/use-profile.ts`) for profile CRUD operations
- User avatar display with fallback initials throughout the application

**Username System** (`/lib/username-utils.ts`)
- Consistent username generation from email addresses
- Username collision resolution with domain-based suffixes
- Current user detection and navigation highlighting
- URL generation utilities for profile pages

### ✅ Enhanced UI Controls

**Selection Mode System**
- Multi-select functionality for content items and universes
- Bulk operations support with visual selection indicators
- Drag & drop integration with selection mode toggles
- Consistent selection patterns across content and universe lists

**Responsive Navigation**
- Mobile-optimized hamburger menu with overlay
- Globe icon branding with proper image optimization
- User profile dropdown with sign out and account management
- Breadcrumb navigation with context awareness

**Public Universe Discovery**
- Public universe browsing with user attribution
- Visual distinction between owned and public content
- Navigation context preservation across public browsing
- Badge system for ownership indication

## Core Principles

- **Universal CRUD**: Create/Read/Update/Delete for ALL entities
- **Unlimited nesting**: Content items can have infinite child levels
- **Custom types**: Universe-specific organisation types with emojis
- **Component modularity**: Large components broken into focused, reusable units
- **Bulk operation patterns**: Scalable architecture for batch processing with progress tracking
- **Error resilience**: Strategic error boundaries for production stability and crash recovery
- **Form standardization**: Consistent error handling, validation, and user experience patterns
- **Clean code**: No TODOs, unused imports, or placeholder logic

## Success Criteria ✅ **ACHIEVED**

The platform successfully delivers:

- ✅ **Flexible hierarchies** without fixed categories - Multi-placement system allows content in multiple locations
- ✅ **Content version management** - Primary version system with rich metadata and Git-like universe versioning
- ✅ **Comprehensive relationship system** - Built-in and custom relationship types with bidirectional linking
- ✅ **Dynamic content reorganisation** - Drag & drop reordering with cross-parent movement and bulk operations
- ✅ **Unlimited nested hierarchies** - Infinite child levels with efficient tree queries and placement management
- ✅ **Performance at scale** - Optimized queries, React Query caching, and efficient tree rendering
- ✅ **Production-ready code** - Zero unused imports, hooks, or dead logic with comprehensive TypeScript coverage
- ✅ **Automated SQL setup** - All migrations run via Supabase CLI without manual intervention
- ✅ **Modern stack implementation** - Tailwind v4 PostCSS, Next.js 15 App Router, TypeScript throughout
- ✅ **Component standardization** - 100% standardized UI components with consistent patterns and error handling

## Constraints

- Codebase must remain simple and maintainable.
- British English throughout.
- Good TypeScript coverage.
- Mobile-responsive design.
- Optimised for performance with large content trees.
- No unfinished or placeholder code anywhere in the repository.

## Core Design Principles

### Universal CRUD Principle

**For ANY entity in CanonCore, users must have full control:**

- ✅ **Add** (Create) - Users can create new items
- ✅ **Edit** (Update) - Users can modify existing items
- ✅ **Delete** (Remove) - Users can remove items they no longer need

This applies to ALL entities: universes, content items, custom organisation types, versions, links, and any future additions. Consistency in data management is fundamental to user experience.

---

## Documentation

For detailed information about the project's development history and architecture:

- **[Architecture Guide](./docs/architecture.md)** - System architecture, data flow, and component relationships with diagrams
- **[Phase Summary](./docs/phase-summary.md)** - Complete development phase history (Phases 1-12)
- **[Custom Hooks Architecture](./docs/custom-hooks-architecture.md)** - Comprehensive hook system documentation (23 files, 81 exports)

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
