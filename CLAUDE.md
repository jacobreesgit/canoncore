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

## Core Principles

- **Universal CRUD**: Create/Read/Update/Delete for ALL entities
- **Unlimited nesting**: Content items can have infinite child levels
- **Custom types**: Universe-specific organisation types with emojis
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

This applies to ALL entities: universes, content items, custom organisation types, versions, links, and any future additions. Consistency in data management is fundamental to user experience.

---

## Phase Summary

### ✅ Phase 1 - Core Platform (Complete)

- **1.0**: Project setup, database, authentication, basic CRUD operations
- **1.5**: Full CRUD for universes and content items with confirmation dialogs
- **1.6**: Universe-specific custom organisation types with emoji support
- **1.7**: Built-in organisation type disabling per universe
- **1.8**: UX improvements for type management and tree navigation

### ✅ Phase 2 - Advanced Features (Complete)

- **2.1**: Git-like universe versioning with snapshots and switching
- **2.2**: Enhanced tree interaction, content detail pages, simplified organisation types
- **2.3A**: Drag & drop reordering with visual feedback and cross-parent movement
- **2.3B**: Bulk operations system with multi-select and batch move/delete
- **2.4**: Content item versions with primary version system and rich metadata

### ✅ Phase 3 - Code Organization (Complete)

- **3.1**: Component consolidation, button standardization, modal system unification
- **3.2**: UI primitives extraction (Card, Loading, Badge components) - **COMPLETE**
- **3.3**: Generic CRUD patterns and hook abstractions - **COMPLETE**
- **3.4**: Username-based routing & collision resolution - **COMPLETE**
- **3.5**: Page component separation, file organization, and code quality - **COMPLETE**

**📋 Next Steps**

### ✅ Phase 4 - Design Improvements (Complete)

- **4.1**: Unified sidebar layout with logo and user profile across all pages
- **4.2**: Content Types → Organisation Types comprehensive rename (database, UI, code)
- **4.3**: Action buttons moved to sidebar above edit/delete buttons for better UX
- **4.4**: UserSidebarCard removal in favor of direct UserProfile component usage
- **4.5**: Hydration mismatch fixes and consistent 2:1 content ratio across pages

### ✅ Phase 5 - Mobile UX (Complete)

- **5.1**: Responsive header with hamburger menu and avatar menu - **COMPLETE**
- **5.2**: Mobile layout with stacked content cards (<768px breakpoint) - **COMPLETE**
- **5.3**: Web-native navigation patterns (no footer tabs, no FAB) - **COMPLETE**
- **5.4**: Hamburger menu with universe list and switching - **COMPLETE**
- **5.5**: Avatar menu with user actions (sign out, delete account) - **COMPLETE**
- **5.6**: Breadcrumb navigation for mobile context - **COMPLETE**
- **5.7**: Responsive breakpoint testing (768px, 1024px) - **COMPLETE**

### Phase 6 - Content Relationships:

- **Item Linking System** - Connect related content across hierarchy
  - Sequel/prequel/spinoff/adaptation relationships
  - **Multi-Collection Membership** - Same content appearing in multiple collections
    - Stories can belong to multiple collections simultaneously (e.g., "First Doctor" + "Tenth Doctor")
    - Shared content maintains single source of truth with multiple collection references
    - Collection views show all relevant content including shared items
  - Bidirectional relationship management
  - Relationship visualization in content detail panel

### Phase 7 - Hierarchical vs. Chronological Views:

- **Multiple organization perspectives**
  - Switch between structural hierarchy and release/production order
  - Independent ordering systems for same content
  - Timeline view with drag-and-drop chronological reordering

## Custom Hooks Architecture (16 Files with 50+ Individual Hooks)

### 🏗️ **Generic CRUD Foundation** - `use-entity-crud.ts`

**Infrastructure Pattern for All Entity Operations:**

- `useEntities<T>(config, filters)` - Generic multi-entity fetch with filtering & ordering
- `useEntity<T>(config, id)` - Generic single entity fetch with caching
- `useCreateEntity<T>(config)` - Generic creation with auth, validation & optimistic updates
- `useUpdateEntity<T>(config)` - Generic updates with optimistic UI & error handling
- `useDeleteEntity<T>(config)` - Generic deletion with cleanup & query invalidation

*Note: These are used internally by other hooks to provide consistent CRUD patterns*

### 🔄 **Entity Management Hooks (Using Generic Patterns)**

**Universe Management** - `use-universes.ts`
- `useUniverses()` - User's universe collection with filtering
- `useUniverse(username, slug)` - Single universe lookup by slug
- `useCreateUniverse()` - Universe creation with slug generation + initial version
- `useUpdateUniverse()` - Universe updates with slug regeneration  
- `useDeleteUniverse()` - Universe deletion with cascade cleanup

**Content Management** - `use-content-items.ts`
- `useContentItems(universeId)` - Hierarchical tree building with parent-child relationships
- `useCreateContentItem()` - Order index management + slug generation + default version creation
- `useUpdateContentItem()` - Slug regeneration + universe version snapshot updates
- `useDeleteContentItem()` - Cascade delete children + version cleanup
- `useReorderContentItems()` - Batch drag & drop with order index recalculation
- `useContentItemBySlug(universeId, slug)` - Content lookup by slug for routing

**Custom Organisation Types** - `use-custom-organisation-types.ts`
- `useCustomOrganisationTypes(universeId)` - Universe-specific custom types
- `useCreateCustomOrganisationType()` - Custom type creation via entity form
- `useUpdateCustomOrganisationType()` - Custom type updates via entity form  
- `useDeleteCustomOrganisationType()` - Custom type deletion
- `useAllOrganisationTypes(universeId)` - Combined built-in + custom types with disable filtering

**Built-in Type Management** - `use-disabled-organisation-types.ts`
- `useDisabledOrganisationTypes(universeId)` - Disabled types per universe
- `useDisableOrganisationType()` - Disable built-in organisation type
- `useEnableOrganisationType()` - Re-enable built-in organisation type

**Content Versions** - `use-content-versions.ts`
- `useContentVersions(contentItemId)` - Version history for content items
- `useCreateContentVersion()` - Version creation with universe snapshot updates
- `useUpdateContentVersion()` - Version metadata updates with universe snapshot updates
- `useDeleteContentVersion()` - Version deletion with primary reassignment
- `useSetPrimaryVersion()` - Primary version designation
- `useContentVersionCount(contentItemId)` - Version count for UI badges

**Universe Versioning** - `use-universe-versions.ts`
- `useUniverseVersions(universeId)` - Git-like version history with branching support
- `useCreateUniverseVersion()` - Snapshot creation with commit messages
- `useUpdateUniverseVersion()` - Universe version metadata updates
- `useSwitchUniverseVersion()` - Time travel between universe states
- `useDeleteUniverseVersion()` - Version cleanup with auto-restore logic
- `useNextVersionNumber(universeId)` - Sequential version numbering

### 🎯 **Specialized Feature Hooks**

**List Management System** - `use-list-management.ts` + supporting files
- `useContentListManagement()` - Specialized content management with drag & drop + bulk ops
- `useListManagement<T>(config)` - Master hook combining all list patterns
- `useDragDrop<T>(config)` - Generic drag & drop with configurable callbacks (`use-drag-drop.ts`)
- `useListSelection<T>(config)` - Multi-select state management (`use-list-selection.ts`)
- `useBulkOperations<T>(config)` - Bulk operation handling for selected items (`use-list-selection.ts`)
- `useListOperations<T>(config)` - Sorting, filtering, and search utilities (`use-list-operations.ts`)
- `useTreeOperations<T>(config)` - Hierarchical data manipulation (`use-tree-operations.ts`)

**Utility Functions (from list management files):**
- `flattenTree<T>()`, `buildTree<T>()` - Tree data structure utilities (`use-drag-drop.ts`)
- `treeUtils` - Additional tree manipulation utilities (`use-tree-operations.ts`)

**Page Data Aggregation** - `use-page-data.ts`
- `useUserUniversesPageData(username)` - Combined data for user universe listings
- `useUniversePageData(username, slug)` - Combined data for universe detail pages
- `useContentDetailPageData(username, universeSlug, contentId)` - Combined data for content detail pages

**Authentication & Account** - `use-account-deletion.ts` + context
- `useDeleteAccount()` - Account deletion with data cleanup and confirmation
- `useAuth()` - Google OAuth + Email/Password authentication (via auth context)

**Responsive Design** - `use-media-query.ts`
- `useMediaQuery(query)` - Generic media query hook with SSR safety
- `useIsDesktop()` - Desktop breakpoint detection (≥1024px)
- `useIsMobile()` - Mobile breakpoint detection (≤767px)
- `useIsTablet()` - Tablet breakpoint detection (768px-1023px)
- `useBreakpoint()` - Current breakpoint detection ('mobile' | 'tablet' | 'desktop')

### 🔧 **Utility & Pattern Hooks**

**Form Patterns** - `use-form-patterns.ts`
- `FieldPresets` - Pre-configured form field sets (universe, contentItem, version, etc.)
- `StandardFields` - Reusable form field builders (name, title, description, select, etc.)
- `useMutationStates(...mutations)` - Multiple mutation state tracking for complex forms
- `useFormState<T>(config)` - Generic form state management with validation *Available but currently unused*
- `Validators` - Validation function library (email, required, minLength, etc.)
- `StandardMessages` - Consistent error and success message templates

## 📊 **Current Usage Statistics**

- **Total Hook Files:** 16
- **Total Individual Hooks/Functions:** 55+
- **Core Hooks:** 45+ hooks actively used in components
- **Utility Functions:** 10+ additional exported utilities and objects
- **Actively Used:** ~90% of functions are in active use
- **Infrastructure vs Direct Use:** Generic CRUD hooks used internally, specialized hooks used directly
- **Architecture Health:** Well-organized with minimal unused code

## ✅ **Architecture Strengths**

1. **Generic CRUD Foundation** - Consistent patterns for all entity operations
2. **Specialized Abstractions** - Complex features like list management, versioning, and page data aggregation
3. **Responsive Design Integration** - Media query hooks for mobile/desktop layout switching
4. **Form Pattern Standardization** - Reusable field presets and validation patterns
5. **Minimal Unused Code** - High utilization rate with purposeful abstractions
