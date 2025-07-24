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

- ✅ **Icon components** - Consistent SVG usage across all components
  - Complete icon component system with 7 icons (EditIcon, DeleteIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon, DragHandleIcon)
  - All hardcoded SVG patterns extracted into reusable components
  - Consistent styling and configurable className props for all icons

### Phase 3.3 - Generic CRUD Patterns

- ✅ **3.3.1 Hook Patterns** - Abstract common data operations

  - ✅ Generic useEntity hook pattern for consistent API calls (`hooks/use-entity-crud.ts`)
  - ✅ Unified loading/error state management with `EntityState<T>` interface
  - ✅ Consistent optimistic updates across entities with generic mutation hooks
  - ✅ Generic pagination and filtering patterns with configurable EntityConfig
  - ✅ Fixed description field validation issue - empty descriptions now save as null consistently
  - ✅ **Migration complete**: 12 hooks successfully migrated to generic CRUD abstraction
    - ✅ Universe Management (5 hooks) - Migrated with slug generation & initial version creation
    - ✅ Custom Content Types (4 hooks) - Migrated with emoji defaults & universe filtering
    - ✅ Built-in Type Management (3 hooks) - Migrated with enable/disable operations

- [ ] **3.3.2 Form Patterns** - Standardized form handling

  - Generic form validation with consistent error messages
  - Unified form submission patterns
  - Consistent field validation across all forms
  - Generic form state management hooks

- [ ] **3.3.3 List Management** - Consistent list operations

  - Generic drag & drop implementation
  - Unified bulk selection patterns
  - Consistent sorting and filtering
  - Generic tree manipulation utilities

  - [ ] **3.3.4 Layout Primitives - Reusable layout patterns**
        Stack component for consistent spacing
        Grid layouts for responsive content
        Sidebar patterns for consistent widths
        Header patterns with title/actions structure

### Phase 3.4 - Next.js Best Practices

- [ ] **3.4.1 File Organization** - Optimize project structure

  - Organize components by domain vs. type
  - Create consistent barrel exports
  - Separate page components from business logic
  - Implement proper component composition patterns

- [ ] **3.4.2 Performance Optimization** - React performance patterns

  - Implement proper memoization patterns
  - Optimize re-renders with React.memo
  - Extract expensive computations to useMemo
  - Optimize component bundle sizes

- [ ] **3.4.3 TypeScript Enhancement** - Stronger type safety
  - Create generic types for CRUD operations
  - Implement proper discriminated unions
  - Add comprehensive prop type definitions
  - Create utility types for common patterns

**Success Criteria:**

- 50% reduction in component duplication
- Consistent UI patterns across all pages
- Generic hooks that work for any entity type

**📋 Next Steps**

### Phase 4.1 - Content Relationships:

- **Item Linking System** - Connect related content across hierarchy
  - Sequel/prequel/spinoff/adaptation relationships
  - **Multi-Collection Membership** - Same content appearing in multiple collections
    - Stories can belong to multiple collections simultaneously (e.g., "First Doctor" + "Tenth Doctor")
    - Shared content maintains single source of truth with multiple collection references
    - Collection views show all relevant content including shared items
  - Bidirectional relationship management
  - Relationship visualization in content detail panel

### Phase 4.2 Hierarchical vs. Chronological Views - Multiple organization perspectives

Switch between structural hierarchy and release/production order
Independent ordering systems for same content
Timeline view with drag-and-drop chronological reordering

## Custom Hooks Architecture (37 Total: 5 Generic + 32 Specialized)

### 🏗️ **Generic CRUD Foundation (5 hooks)**

**Base Pattern for All Entity Operations:**

- `useEntities<T>(config, filters)` - Generic multi-entity fetch with filtering & ordering
- `useEntity<T>(config, id)` - Generic single entity fetch with caching
- `useCreateEntity<T>(config)` - Generic creation with auth, validation & optimistic updates
- `useUpdateEntity<T>(config)` - Generic updates with optimistic UI & error handling
- `useDeleteEntity<T>(config)` - Generic deletion with cleanup & query invalidation

### 🔄 **Migrated to Generic Pattern (12 hooks)**

**Universe Management (5 hooks)** - `use-universes.ts`

- `useUniverses()` → `useEntities(universeConfig)` + user filtering
- `useCreateUniverse()` → `useCreateEntity(universeConfig)` + slug generation + initial version
- `useUniverse(slug)` → `useEntity(universeConfig)` + slug-based lookup
- `useUpdateUniverse()` → `useUpdateEntity(universeConfig)` + slug regeneration
- `useDeleteUniverse()` → `useDeleteEntity(universeConfig)` + cascade cleanup

**Custom Content Types (4 hooks)** - `use-custom-content-types.ts`

- `useCustomContentTypes(universeId)` → `useEntities(customTypeConfig)` + universe filtering
- `useCreateCustomContentType()` → `useCreateEntity(customTypeConfig)` + emoji defaults
- `useUpdateCustomContentType()` → `useUpdateEntity(customTypeConfig)`
- `useDeleteCustomContentType()` → `useDeleteEntity(customTypeConfig)`

**Built-in Type Management (3 hooks)** - `use-disabled-content-types.ts`

- `useDisabledContentTypes(universeId)` → `useEntities(disabledTypeConfig)` + universe filtering
- `useDisableContentType()` → `useCreateEntity(disabledTypeConfig)` + composite key handling
- `useEnableContentType()` → Custom deletion logic (composite key delete)

### 🎯 **Specialized Hooks (20 hooks)**

**Authentication (1 hook)** - OAuth integration

- `useAuth()` - Google OAuth with Supabase integration

**Content Management (6 hooks)** - Complex hierarchical operations

- `useContentItems(universeId)` - Hierarchical tree building with parent-child relationships
- `useCreateContentItem()` - Order index management + slug generation + default version creation
- `useUpdateContentItem()` - Slug regeneration + universe version snapshot updates
- `useDeleteContentItem()` - Cascade delete children + version cleanup
- `useReorderContentItems()` - Batch drag & drop with order index recalculation
- `useBulkSelection()` - UI state for multi-select operations

**Universe Versioning (9 hooks)** - Git-like version control system

- `useUniverseVersions(universeId)` - Version history with branching support
- `useCurrentUniverseVersion(universeId)` - Active version state management
- `useCreateUniverseVersion()` - Snapshot creation with commit messages
- `useSwitchUniverseVersion()` - Time travel between universe states
- `useRestoreUniverseVersion()` - Rollback to previous versions
- `useDeleteUniverseVersion()` - Version cleanup with auto-restore logic
- `useNextVersionNumber(universeId)` - Sequential version numbering
- `useVersionSnapshot(versionId)` - Snapshot data retrieval
- `updateCurrentVersionSnapshot(universeId)` - Live version updates

**Content Item Versioning (7 hooks)** - Primary version management

- `useContentVersions(contentItemId)` - Version history per content item
- `useCreateContentVersion()` - Version creation with rich metadata
- `useUpdateContentVersion()` - Version editing with primary handling
- `useDeleteContentVersion()` - Version deletion with primary reassignment
- `useSetPrimaryVersion()` - Primary version designation
- `usePrimaryContentVersion(contentItemId)` - Primary version retrieval
- `useContentVersionCount(contentItemId)` - Count for UI badges

### 🔧 **Utility Hooks (2 hooks)**

**Query Helpers:**

- `useAllContentTypes(universeId)` - Combined built-in + custom types with disable filtering
- `useIsContentTypeDisabled(universeId, contentType)` - Type availability checking

## Migration Impact

**✅ Code Reduction:**

- **~300 lines** of duplicated CRUD logic eliminated
- **12 hooks** now share consistent patterns
- **8 components** updated with standardized interfaces

**✅ Consistency Gains:**

- Unified error handling across all entity operations
- Standardized loading states with `EntityState<T>`
- Consistent authentication checks in all mutations
- Automatic optimistic UI updates via React Query

**✅ Maintainability:**

- Single source of truth for CRUD patterns
- Type-safe generic approach with `EntityConfig<T>`
- Predictable hook interfaces across entities
- Centralized business logic in entity configurations
