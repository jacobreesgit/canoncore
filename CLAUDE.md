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

## Phase Summary

### ✅ Phase 1 - Core Platform (Complete)

- **1.0**: Project setup, database, authentication, basic CRUD operations
- **1.5**: Full CRUD for universes and content items with confirmation dialogs
- **1.6**: Universe-specific custom content types with emoji support
- **1.7**: Built-in content type disabling per universe
- **1.8**: UX improvements for type management and tree navigation

### ✅ Phase 2 - Advanced Features (Complete)

- **2.1**: Git-like universe versioning with snapshots and switching
- **2.2**: Enhanced tree interaction, content detail pages, simplified content types
- **2.3A**: Drag & drop reordering with visual feedback and cross-parent movement
- **2.3B**: Bulk operations system with multi-select and batch move/delete
- **2.4**: Content item versions with primary version system and rich metadata

### ✅ Phase 3 - Code Organization (In Progress)

- **3.1**: Component consolidation, button standardization, modal system unification
- **3.2**: UI primitives extraction (Card, Loading, Badge components) - **COMPLETE**
- **3.3**: Generic CRUD patterns and hook abstractions - **PENDING**
- **3.4**: Next.js best practices and performance optimization - **PENDING**

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth + RLS)
- **React Query** (server state) + **Zustand** (client state)
- **Route**: `/universes/:slug` with hierarchical tree view

## Core Principles

- **Universal CRUD**: Create/Read/Update/Delete for ALL entities
- **Unlimited nesting**: Content items can have infinite child levels
- **Custom types**: Universe-specific content types with emojis
- **Clean code**: No TODOs, unused imports, or placeholder logic

## Success Criteria

The platform must:

- Support flexible hierarchies without fixed categories.
- Allow management of multiple content versions.
- Enable linking of related items.
- Allow reorganisation of content.
- Support unlimited levels of nested children.
- Scale to large datasets efficiently.
- Have clean, production-ready code free from unused imports, hooks, or dead logic.
- Run all SQL setup via Supabase CLI without manual intervention.
- Follow Tailwind v4 PostCSS setup guide.
- Be based on Vercel's Next.js boilerplate.

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

This applies to ALL entities: universes, content items, custom content types, versions, links, and any future additions. Consistency in data management is fundamental to user experience.

---

### ✅ Phase 3.2 Complete - UI Primitives Extraction! 🎉

**Base UI Components:**

- ✅ **Card component** - Unified card styling with configurable padding/shadow options

  - Extracted from 11 components with `bg-white rounded-lg p-6 shadow-sm` patterns
  - Configurable padding (none, sm, md, lg) and shadow (none, sm, md, lg) options
  - Single source of truth for all card styling across the application

- ✅ **Loading states** - Comprehensive loading component suite

  - `LoadingSpinner` - Animated spinner with configurable sizes
  - `LoadingSkeleton` - Skeleton placeholders for content areas
  - `LoadingPlaceholder` - Generic placeholder blocks
  - `LoadingCard` - Card-specific loading states with optional titles
  - `LoadingButtonContent` - Button loading states with spinner integration

- ✅ **Badge component** - Status and count indicators with variants

  - Base `Badge` component with 6 variants (primary, secondary, success, warning, danger, info)
  - `VersionBadge` - Specialized for content item version counts
  - `StatusBadge` - Status indicators like "Primary" with variant support
  - `TypeBadge` - Content type labels with consistent styling
  - Migrated all hardcoded badge patterns from version cards and content trees

- [ ] **Icon components** - Consistent SVG usage (partially complete)
  - Standard icon components already exist (EditIcon, DeleteIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon)
  - Need to extract remaining hardcoded SVG patterns into reusable components

### Phase 3.3 - Generic CRUD Patterns

- [ ] **Hook Patterns** - Abstract common data operations

  - Generic useEntity hook pattern for consistent API calls
  - Unified loading/error state management
  - Consistent optimistic updates across entities
  - Generic pagination and filtering patterns

- [ ] **Form Patterns** - Standardized form handling

  - Generic form validation with consistent error messages
  - Unified form submission patterns
  - Consistent field validation across all forms
  - Generic form state management hooks

- [ ] **List Management** - Consistent list operations

  - Generic drag & drop implementation
  - Unified bulk selection patterns
  - Consistent sorting and filtering
  - Generic tree manipulation utilities

  - For univerrser, if you edit and make description blank it does not save. check this for all description fields. For title fields, it should not save if blank obviously.

### Phase 3.4 - Next.js Best Practices

- [ ] **File Organization** - Optimize project structure

  - Organize components by domain vs. type
  - Create consistent barrel exports
  - Separate page components from business logic
  - Implement proper component composition patterns

- [ ] **Performance Optimization** - React performance patterns

  - Implement proper memoization patterns
  - Optimize re-renders with React.memo
  - Extract expensive computations to useMemo
  - Optimize component bundle sizes

- [ ] **TypeScript Enhancement** - Stronger type safety
  - Create generic types for CRUD operations
  - Implement proper discriminated unions
  - Add comprehensive prop type definitions
  - Create utility types for common patterns

**Success Criteria:**

- 50% reduction in component duplication
- Consistent UI patterns across all pages
- Generic hooks that work for any entity type
- Maintainable codebase ready for Phase 2.5+ features

## Custom Hooks (36 Implemented)

**Authentication (1):**

- `useAuth()` - Google OAuth management

**Universe Management (5):**

- `useUniverses()` - Fetch all universes for user
- `useCreateUniverse()` - Create universe with slug generation
- `useUniverse(slug)` - Fetch single universe by slug
- `useUpdateUniverse()` - Update universe name/description
- `useDeleteUniverse()` - Delete universe and all content

**Content Management (6):**

- `useContentItems(universeId)` - Fetch hierarchical content tree
- `useCreateContentItem()` - Create content with proper ordering
- `useUpdateContentItem()` - Update content title/description/type
- `useDeleteContentItem()` - Delete content and children
- `useReorderContentItems()` - Batch reorder items with drag & drop support
- `useBulkSelection()` - Multi-select state management for bulk operations

**Custom Content Types (5):**

- `useCustomContentTypes(universeId)` - Fetch universe-specific custom types
- `useCreateCustomContentType()` - Create custom type with emoji
- `useUpdateCustomContentType()` - Update custom type name/emoji
- `useDeleteCustomContentType()` - Delete custom type
- `useAllContentTypes(universeId)` - Combined built-in + custom types

**Built-in Type Management (4):**

- `useDisabledContentTypes(universeId)` - Fetch disabled built-in types
- `useDisableContentType()` - Disable built-in type for universe
- `useEnableContentType()` - Enable built-in type for universe
- `useIsContentTypeDisabled()` - Check if type is disabled

**Universe Versioning (9):**

- `useUniverseVersions(universeId)` - Fetch all versions for universe
- `useCurrentUniverseVersion(universeId)` - Get active version
- `useCreateUniverseVersion()` - Create new version (commit)
- `useSwitchUniverseVersion()` - Switch between versions
- `useRestoreUniverseVersion()` - Restore to previous version
- `useDeleteUniverseVersion()` - Delete version with auto-restore
- `useNextVersionNumber(universeId)` - Get next version number
- `useVersionSnapshot(versionId)` - Get version snapshot data
- `updateCurrentVersionSnapshot(universeId)` - Update live version

**Content Item Versioning (7):**

- `useContentVersions(contentItemId)` - Fetch all versions for content item
- `useCreateContentVersion()` - Create new content version with metadata
- `useUpdateContentVersion()` - Update existing content version
- `useDeleteContentVersion()` - Delete content version with primary handling
- `useSetPrimaryVersion()` - Set version as primary/default
- `usePrimaryContentVersion(contentItemId)` - Get primary version for item
- `useContentVersionCount(contentItemId)` - Get version count for badges
