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

**Form System Integration**
- FormModal component uses standardized Input and Textarea components
- All hardcoded input/textarea elements replaced throughout codebase
- Consistent validation and error display patterns
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

- **5.1**: Responsive header with hamburger menu and user profile - **COMPLETE**
- **5.2**: Mobile layout with stacked content cards (<768px breakpoint) - **COMPLETE**
- **5.3**: Web-native navigation patterns (no footer tabs, no FAB) - **COMPLETE**
- **5.4**: Hamburger menu with user profile only (no universe navigation) - **COMPLETE**
- **5.5**: User profile dropdown with sign out and delete account actions - **COMPLETE**
- **5.6**: Breadcrumb navigation for desktop and mobile context - **COMPLETE**
- **5.7**: Responsive breakpoint detection hooks (768px, 1024px) - **COMPLETE**
- **5.8**: Mobile overlay transparency (0.55 opacity) for visibility - **COMPLETE**

### ✅ Phase 6 - Content Relationships (Complete - Simplified)

**Simple but Great Feature Implementation:**

- **6.1**: Simplified Relationship Types - 4 core types (sequel, spinoff, reference, related) instead of 9 complex types
- **6.2**: Basic CRUD Operations - Create, read, update, delete relationships with duplicate prevention only
- **6.3**: Clean List View - Simple relationship list with type badges, direction arrows, and clickable navigation
- **6.4**: Searchable Content Selector - Find and relate content items with search functionality
- **6.5**: Custom Relationship Types System - Universe-specific custom types following organisation type patterns
- **6.6**: Seed Data Integration - Realistic relationship patterns for development testing

**Database Tables Added:**

- `custom_relationship_types` - Universe-specific custom relationship types
- `disabled_relationship_types` - Per-universe built-in type disabling

### ✅ Phase 7 - Multi-Placement System (Complete)

**Multiple Hierarchy Placement Implementation:**

- **7.1**: Database Schema - `content_placements` table with many-to-many parent-child relationships
- **7.2**: Data Migration - Migrated existing `parent_id` relationships to placements table
- **7.3**: Tree Queries - Updated content tree queries to fetch and build hierarchy from placements
- **7.4**: UI Support - Placement badges show when content appears in multiple locations (e.g., "3 locations")
- **7.5**: Management Interface - Complete placement management modal with add/remove functionality
- **7.6**: Seed Data - Multi-placement examples demonstrating cross-over content organization

**Database Tables Added:**

- `content_placements` - Many-to-many content-to-parent relationships with ordering

**Key Features:**

- Same content appearing in multiple hierarchy locations while maintaining single source of truth
- Cross-over content appears under relevant sections (e.g., "A New Hope" under "Original Trilogy Era", "Movies", and "Empire Era")
- One content detail page, multiple hierarchy placements for flexible organization
- Visual indicators when content appears in multiple locations
- User-friendly placement management with root level support

### Phase 8 - Public Universes & User Engagement

**✅ 8.1**: Universe Privacy & Source Tracking (Complete)

- Added `is_public` boolean to universes (default true) with proper RLS policies
- Added `source_url` and `source_description` fields for data source attribution
- Updated universe creation/edit forms with privacy toggle and source fields
- Extended form system to support checkbox and URL field types with validation
- Updated seed data with realistic public/private examples and source attribution

**✅ 8.2**: Public Universe Discovery (Complete)

- Public universes page using same design as existing universes page
- Simple list/search of public universes from all users
- Add "Browse Public Universes" section to sidebar navigation

**✅ 8.3**: Navigation & User Experience Consolidation (Complete)

**Problem:** Current sidebar mixing user profile display with navigation creates visual clutter and unclear user flows.

**Solution:** Clean separation of concerns with navigation-focused sidebar and consolidated user dashboard:

**Navigation Sidebar Changes:**
- Remove UserProfile card component entirely from sidebar
- Replace with clean navigation buttons following "Browse Public Universes" pattern:
  - 🏠 Dashboard (replaces "Your Universes", leads to user's home page)
  - 🌍 Browse Public (existing)
  - ⭐ Favourites (future Phase 8.4)
- Consistent button styling: emoji + label, hover effects, rounded corners
- Logo area remains unchanged

**User Dashboard Page (`/[username]`):**
- Merge profile information with universe grid on single page
- Top section: Compact user profile (name, username, universe count) + Create Universe action
- Main section: Universe grid (existing design)
- Same route, enhanced functionality - no breaking changes

**User Actions Relocation:**
- Move Sign Out and Delete Account to header user avatar dropdown
- Header pattern: [Breadcrumbs] ──────── [👤 Avatar ▼] with dropdown menu
- Follows standard app conventions (GitHub, Discord, Slack pattern)
- Mobile: Existing ResponsiveHeader hamburger already handles this

**Benefits:**
- Cleaner visual hierarchy with single-purpose sidebar
- Scalable navigation pattern for future features
- Standard UX patterns users expect
- Reduced cognitive load and visual clutter
- Better mobile experience

### ✅ Phase 9 - UI/UX Refinements & Data Consistency (Complete)

**✅ 9.1**: Universe Card & Navigation Improvements (Complete)

- Removed edit/delete buttons from universe cards for cleaner design
- Removed view toggle buttons from universes pages (card view only)
- Defaulted detail pages to tree view with functional card view for direct descendants
- Fixed card view functionality with proper conditional rendering and ContentCard component
- Added user information integration in public universe cards (avatar + username)
- Removed source_description field completely from project (database, forms, seed data)

**✅ 9.2**: Public Universe Page Enhancements (Complete)

- Fixed usePublicUniverses hook to use proper custom queryFn in options parameter
- Fixed useEntities to respect custom queryFn when provided via options
- Resolved foreign key relationships between universes and profiles tables
- Cleaned up orphaned data and established proper database constraints
- Enhanced public universe cards with user avatars and @username display
- Standardized user attribution format (@username) consistent with URL routing

**✅ 9.3**: Navigation System Unification (Complete)

- Created centralized username utility functions in `lib/username-utils.ts`
- Unified username generation logic across authentication, navigation, and routing
- Fixed sidebar navigation active states using consistent pathname matching
- Resolved username format inconsistencies (demo vs demo-gmail) between profiles and universes
- Updated all username references throughout app to use utility functions
- Consistent navigation behavior: proper active states and correct URL generation

**Database Schema Updates:**

- Removed `source_description` column from universes table
- Added proper foreign key constraint between universes.user_id and profiles.id
- Updated RLS policies for public universe access

**Key Technical Achievements:**

- 100% functional public universe discovery with proper user attribution
- Consistent username handling across all app components
- Clean, maintainable navigation system with centralized logic
- Proper database relationships and data integrity

### ✅ Phase 10 - Public Universe Enhancements & Visual Improvements (Complete)

- **10.1**: Public Universe Visual Distinction - "Yours" badges, consistent badge system throughout app
- **10.2**: Public Browsing Context Navigation - `?from=public` URL parameter system for navigation context
- **10.3**: Visual Consistency Improvements - Globe icon sizing, standardized badge usage

### ✅ Phase 11 - Profile System & UI Infrastructure (Complete)

- **11.1**: Profile Management System - Complete profile editing with avatar upload, drag & drop functionality
- **11.2**: Standardized Form Components - Input and Textarea components with consistent styling and validation
- **11.3**: Advanced Hook Infrastructure - Generic version management, confirmation modals, toast notifications
- **11.4**: Sidebar Layout Improvements - Fixed height constraints, floating design, proper overflow handling

## Custom Hooks Architecture (23 Files with 81 Individual Exports)

### ✅ **USED HOOKS** (81 exports actively used in components)

#### 🏗️ **Generic CRUD Foundation** - `use-entity-crud.ts`

**Infrastructure Pattern for All Entity Operations:**

- ✅ `useEntities<T>(config, filters)` - Generic multi-entity fetch with filtering & ordering
- ✅ `useEntity<T>(config, id)` - Generic single entity fetch with caching
- ✅ `useCreateEntity<T>(config)` - Generic creation with auth, validation & optimistic updates
- ✅ `useUpdateEntity<T>(config)` - Generic updates with optimistic UI & error handling
- ✅ `useDeleteEntity<T>(config)` - Generic deletion with cleanup & query invalidation
- ✅ `getEntityState<T>(queryResult)` - Entity state extraction utility

_Note: These are used internally by other hooks to provide consistent CRUD patterns_

#### 🔄 **Entity Management Hooks (Using Generic Patterns)**

**Universe Management** - `use-universes.ts`

- ✅ `useUniverses()` - User's universe collection with filtering
- ✅ `useUniverse(username, slug)` - Single universe lookup by slug
- ✅ `useCreateUniverse()` - Universe creation with slug generation + initial version
- ✅ `useUpdateUniverse()` - Universe updates with slug regeneration
- ✅ `useDeleteUniverse()` - Universe deletion with cascade cleanup

**Content Management** - `use-content-items.ts`

- ✅ `useContentItems(universeId)` - Hierarchical tree building with placement-based relationships
- ✅ `useCreateContentItem()` - Order index management + slug generation + placement creation + default version creation
- ✅ `useUpdateContentItem()` - Slug regeneration + universe version snapshot updates
- ✅ `useDeleteContentItem()` - Cascade delete children + placement cleanup + version cleanup
- ✅ `useReorderContentItems()` - Batch drag & drop with order index recalculation
- ✅ `useContentItemBySlug(universeId, slug)` - Content lookup by slug for routing

**Custom Organisation Types** - `use-custom-organisation-types.ts`

- ✅ `useCustomOrganisationTypes(universeId)` - Universe-specific custom types
- ✅ `useCreateCustomOrganisationType()` - Custom type creation via entity form
- ✅ `useUpdateCustomOrganisationType()` - Custom type updates via entity form
- ✅ `useDeleteCustomOrganisationType()` - Custom type deletion
- ✅ `useAllOrganisationTypes(universeId)` - Combined built-in + custom types with disable filtering
- ✅ `BUILT_IN_ORGANISATION_TYPES` - Constant array of built-in types

**Built-in Type Management** - `use-disabled-organisation-types.ts`

- ✅ `useDisabledOrganisationTypes(universeId)` - Disabled types per universe
- ✅ `useDisableOrganisationType()` - Disable built-in organisation type
- ✅ `useEnableOrganisationType()` - Re-enable built-in organisation type

**Content Relationships** - `use-content-links.ts`

- ✅ `useContentLinks(contentItemId)` - Fetch relationships for a content item
- ✅ `useUniverseContentLinks(universeId)` - All relationships in a universe
- ✅ `useCreateContentLink()` - Simple relationship creation with duplicate prevention
- ✅ `useUpdateContentLink()` - Relationship updates (type, description)
- ✅ `useDeleteContentLink()` - Simple relationship deletion
- ✅ `useRelationshipTypes(universeId)` - Combined built-in + custom relationship types
- ✅ `getRelationshipDisplay()` - Display helper for relationship direction and labels

**Custom Relationship Types** - `use-custom-relationship-types.ts`

- ✅ `useCustomRelationshipTypes(universeId)` - Universe-specific custom relationship types
- ✅ `useCreateCustomRelationshipType()` - Create custom relationship type (name + description)
- ✅ `useUpdateCustomRelationshipType()` - Update custom relationship type
- ✅ `useDeleteCustomRelationshipType()` - Delete custom relationship type
- ✅ `useAllRelationshipTypes(universeId)` - Combined built-in + custom types with filtering
- ✅ `BUILT_IN_RELATIONSHIP_TYPES` - Constant array of 4 built-in types

**Built-in Relationship Type Management** - `use-disabled-relationship-types.ts`

- ✅ `useDisabledRelationshipTypes(universeId)` - Disabled relationship types per universe
- ✅ `useDisableRelationshipType()` - Disable built-in relationship type
- ✅ `useEnableRelationshipType()` - Re-enable built-in relationship type

**Content Versions** - `use-content-versions.ts`

- ✅ `useContentVersions(contentItemId)` - Version history for content items
- ✅ `useCreateContentVersion()` - Version creation with universe snapshot updates
- ✅ `useUpdateContentVersion()` - Version metadata updates with universe snapshot updates
- ✅ `useDeleteContentVersion()` - Version deletion with primary reassignment
- ✅ `useSetPrimaryVersion()` - Primary version designation
- ✅ `useContentVersionCount(contentItemId)` - Version count for UI badges

**Content Placements** - `use-content-items.ts` (integrated)

- ✅ `placementCount` - Added to ContentItemWithChildren type for UI display
- ✅ Placement-based tree building - Tree queries fetch from content_placements table
- ✅ Multi-placement creation - Create content under multiple parents simultaneously
- ✅ Placement cleanup - Automatic placement removal when content is deleted

**Universe Versioning** - `use-universe-versions.ts`

- ✅ `useUniverseVersions(universeId)` - Git-like version history with branching support
- ✅ `useCreateUniverseVersion()` - Snapshot creation with commit messages
- ✅ `useUpdateUniverseVersion()` - Universe version metadata updates
- ✅ `useSwitchUniverseVersion()` - Time travel between universe states
- ✅ `useDeleteUniverseVersion()` - Version cleanup with auto-restore logic
- ✅ `useNextVersionNumber(universeId)` - Sequential version numbering
- ✅ `updateCurrentVersionSnapshot(universeId)` - Utility function for version snapshots

#### 🎯 **Specialized Feature Hooks**

**List Management System** - `use-list-management.ts` + supporting files

- ✅ `useContentListManagement()` - Specialized content management with drag & drop + bulk ops
- ✅ `useListManagement<T>(config)` - Master hook combining all list patterns
- ✅ `useDragDrop<T>(config)` - Generic drag & drop with configurable callbacks (`use-drag-drop.ts`)
- ✅ `useListSelection<T>(config)` - Multi-select state management (`use-list-selection.ts`)
- ✅ `useBulkOperations<T>(config)` - Bulk operation handling for selected items (`use-list-selection.ts`)
- ✅ `useListOperations<T>(config)` - Sorting, filtering, and search utilities (`use-list-operations.ts`)
- ✅ `useTreeOperations<T>(config)` - Hierarchical data manipulation (`use-tree-operations.ts`)

**Utility Functions (from list management files):**

- ✅ `flattenTree<T>()`, `buildTree<T>()` - Tree data structure utilities (`use-drag-drop.ts`)
- ✅ `treeUtils` - Additional tree manipulation utilities (`use-tree-operations.ts`)
- ✅ `commonSorts`, `commonFilters`, `commonSearches` - Preset list operation functions (`use-list-operations.ts`)

**Page Data Aggregation** - `use-page-data.ts`

- ✅ `useUserUniversesPageData(username)` - Combined data for user universe listings
- ✅ `useUniversePageData(username, slug)` - Combined data for universe detail pages
- ✅ `useContentDetailPageData(username, universeSlug, contentId)` - Combined data for content detail pages

**Authentication & Account** - `use-account-deletion.ts` + `use-profile.ts`

- ✅ `useDeleteAccount()` - Account deletion with data cleanup and confirmation
- ✅ `useAuth()` - Google OAuth + Email/Password authentication (via auth context)
- ✅ `useProfile()` - Get current user's profile data with caching
- ✅ `useUpdateProfile()` - Update profile information (name, bio, website, avatar)
- ✅ `useUploadAvatar()` - Avatar upload to Supabase Storage with automatic profile update
- ✅ `useRemoveAvatar()` - Remove custom avatar (fallback to Google/initials)
- ✅ `useAvatarUrl()` - Avatar URL generation with fallbacks and upload handling

**Generic UI Patterns** - `use-version-management.ts` + `use-confirmation-modal.ts` + `use-toast.ts`

- ✅ `useVersionManagement<T>(entityId, config)` - Generic version management system for content/universe versions
- ✅ `useConfirmationModal()` - Reusable confirmation dialog system with loading states and variants
- ✅ `useToast()` - Centralized toast notification system with context integration

**Responsive Design** - `use-media-query.ts`

- ✅ `useMediaQuery(query)` - Generic media query hook with SSR safety
- ✅ `useIsDesktop()` - Desktop breakpoint detection (≥1024px)
- ✅ `useIsMobile()` - Mobile breakpoint detection (≤767px)
- ✅ `useIsTablet()` - Tablet breakpoint detection (768px-1023px)
- ✅ `useBreakpoint()` - Current breakpoint detection ('mobile' | 'tablet' | 'desktop')

#### 🔧 **Utility & Pattern Hooks**

**Form Patterns** - `use-form-patterns.ts`

- ✅ `FieldPresets` - Pre-configured form field sets (universe, contentItem, version, etc.)
- ✅ `StandardFields` - Reusable form field builders (name, title, description, select, etc.)
- ✅ `useMutationStates(...mutations)` - Multiple mutation state tracking for complex forms
- ✅ `Validators` - Validation function library (email, required, minLength, etc.)
- ✅ `StandardMessages` - Consistent error and success message templates

---

### ❌ **UNUSED HOOKS** (None - all hooks are actively used)

**All hooks have been cleaned up and are actively used in the codebase.**

---

## 📊 **Hook Usage Statistics Summary**

- **Total Hook Files:** 23
- **Total Individual Exports:** 81
- **✅ Actively Used:** 81 exports (100%)
- **❌ Unused:** 0 exports (0%)
- **Infrastructure vs Direct Use:** Generic CRUD hooks used internally, specialized hooks used directly
- **Architecture Health:** Perfect - zero unused code, well-organized patterns

### **Usage Breakdown:**

- **Core Hooks (Functions):** 65 individual hooks
- **Utility Functions:** 5 standalone functions 
- **Configuration Objects:** 6 entity configs
- **Utility Objects/Constants:** 12 utility objects and constants
- **Responsive Design:** 5 hooks
- **Page Data Aggregation:** 3 hooks
- **Authentication & Profile:** 7 hooks
- **Generic UI Patterns:** 3 hooks
- **Username Utilities:** 4 functions

**Total: 81 exports across 23 files - 100% actively used**

### **Latest Additions:**

- **Profile Management** (`hooks/use-profile.ts`): Complete profile system hooks
  - `useProfile()` - Get current user's profile data with caching
  - `useUpdateProfile()` - Update profile information (name, bio, website)
  - `useUploadAvatar()` - Avatar upload to Supabase Storage with automatic profile update
  - `useRemoveAvatar()` - Remove custom avatar (fallback to Google/initials)
  - `useAvatarUrl()` - Avatar URL generation with fallback priority logic
  - Profile types and interfaces for TypeScript support

- **Generic UI Patterns**: Advanced hook infrastructure for reusable UI interactions
  - `useVersionManagement()` - Generic version management system for both content and universe versions
  - `useConfirmationModal()` - Reusable confirmation dialog system with loading states
  - `useToast()` - Centralized toast notification system with context integration

- **Username Utilities** (`lib/username-utils.ts`): 4 functions for consistent username handling
  - `generateUsernameFromEmail()` - Email to username conversion
  - `getCurrentUsername()` - Get current user's username
  - `isCurrentUserPage()` - Check if viewing own pages
  - `getCurrentUserProfileUrl()` - Get profile URL for current user

- **UI Component System**: Standardized form components
  - `Input` component - All input types with consistent styling and validation
  - `Textarea` component - Auto-resize, character counting, validation patterns
  - Form system integration with existing modal and validation patterns

### ✅ Phase 10 - Public Universe Enhancements & Visual Improvements (Complete)

**✅ 10.1**: Public Universe Visual Distinction (Complete)

- **Own Universe Badges**: Added subtle "Yours" badge using Badge component (variant="primary") on user's own universes in public browsing
- **Badge Component System**: Implemented consistent badge system throughout app:
  - `Badge` (base component) - Used for "Yours" badges with proper variants
  - `PublicPrivateBadge` - Specialized for public/private status
  - `PlacementBadge` - Uses Badge internally for placement counts
  - `VersionBadge`, `StatusBadge`, `TypeBadge`, `CountBadge` - Specialized badge components
- **User Experience**: Shows all public universes (including user's own) with clear visual distinction matching platforms like GitHub, YouTube

**✅ 10.2**: Public Browsing Context Navigation (Complete)

- **Navigation Context Tracking**: Implemented `?from=public` URL parameter system to maintain browsing context
- **Sidebar Active States**: "Browse Public Universes" remains active when viewing content accessed from public page
- **Breadcrumb Updates**: Dynamic breadcrumbs showing "Browse Public Universes" instead of "Universes" when in public context
- **Link Propagation**: All content links maintain `?from=public` parameter throughout navigation
- **Component Updates**:
  - `UniverseCard` - Adds `fromPublic` prop and context parameter to URLs
  - `NavigationSidebar` - Checks search params for proper active state
  - `UniversePage` & `ContentDetailPage` - Context-aware breadcrumbs
  - `ContentTree` & `ContentTreeItem` - Maintains context in all content navigation

**✅ 10.3**: Visual Consistency Improvements (Complete)

- **Globe Icon Sizing**: Updated globe.png in page header from 40px to 48px (w-12 h-12) to match avatar sizing
- **Consistent UI Elements**: Maintained consistent visual hierarchy across all navigation elements
- **Badge Component Usage**: Standardized all badge usage to use proper Badge component instead of inline spans

**Database Schema Updates:**

- Added `isOwn` flag computed in `usePublicUniverses()` hook for frontend badge display
- No database changes required - all handled at query level

**Key Technical Achievements:**

- **Navigation Context Preservation**: Complete browsing context tracking across all page types
- **Badge System Consistency**: 100% usage of proper Badge components throughout the application
- **Visual Polish**: Consistent sizing and spacing across all UI elements
- **User Experience**: Clear distinction between "My Content" vs "Public Browsing" contexts

**Navigation Flow Examples:**

1. **Direct Access**: `/:username/:slug` → Dashboard active, standard breadcrumbs
2. **Via Public Browsing**: `/:username/:slug?from=public` → Browse Public active, public breadcrumbs
3. **Content Navigation**: Maintains context through all content links and detail pages
4. **Visual Indicators**: "Yours" badges on owned content, consistent navigation states

**Component Architecture:**

- **Prop Threading**: `fromPublic` prop threaded through ContentTree → ContentTreeItem hierarchy
- **Search Params**: `useSearchParams` hook used consistently across all page components
- **URL Generation**: Dynamic URL building with context preservation
- **Badge System**: Centralized Badge component with consistent variants and sizing

### ✅ Phase 11 - Profile System & UI Infrastructure (Complete)

**✅ 11.1**: Profile Management System (Complete)

- **Profile Components** (`/components/profile/`):
  - `EditProfileModal` - Complete profile editing with avatar upload
  - `AvatarUpload` - Drag & drop avatar upload with preview and validation
- **Profile Hooks** (`/hooks/use-profile.ts`):
  - `useProfile()` - Get current user's profile data with caching
  - `useUpdateProfile()` - Update profile information (name, bio, website)
  - `useUploadAvatar()` - Avatar upload to Supabase Storage with automatic profile update
  - `useRemoveAvatar()` - Remove custom avatar (fallback to Google/initials)
  - `useAvatarUrl()` - Avatar URL generation with fallback priority logic
- **User Avatar Integration**: Profile avatars displayed throughout app with fallback to initials

**✅ 11.2**: Standardized Form Components (Complete)

- **Input Component** (`/components/ui/forms/input.tsx`):
  - Support for text, email, url, number, password input types
  - Consistent styling with focus states (focus:ring-blue-500 focus:border-blue-500)
  - TypeScript interface extending HTMLInputElement with forwardRef support
  - Label, error, and help text props with prefix/suffix icon support
  - Size variants (sm, md, lg) matching ActionButton, disabled and loading states
- **Textarea Component** (`/components/ui/forms/textarea.tsx`):
  - Extends HTMLTextAreaElement props with consistent Input styling
  - Auto-resize functionality with configurable min/max rows
  - Character count display with max length validation, resize handle control
  - Same error handling and styling patterns as Input component
- **Form System Integration**: All hardcoded input/textarea elements replaced with standardized components

**✅ 11.3**: Advanced Hook Infrastructure (Complete)

- **Version Management Hook** (`/hooks/use-version-management.ts`):
  - Generic version management system for both content and universe versions
  - Configurable field mappings, confirmation dialogs, and business rules
  - Unified pattern for CRUD operations across different version types
- **Confirmation Modal Hook** (`/hooks/use-confirmation-modal.ts`):
  - Reusable confirmation dialog system with loading states
  - Support for different confirmation variants (danger, primary, warning)
  - Async action handling with error management
- **Toast Notification Hook** (`/hooks/use-toast.ts`):
  - Centralized toast notification system with context integration
  - Type-safe exports with proper variant and action type definitions

**✅ 11.4**: Sidebar Layout Improvements (Complete)

- **Desktop Sidebar Enhancements**:
  - Fixed height constraints with `h-screen` for proper viewport fitting
  - Floating sidebar design with rounded corners and shadow
  - Logo section with `flex-shrink-0` to prevent compression
  - Navigation area with `overflow-y-auto` for scrollable content when needed
- **Visual Design Updates**:
  - Updated from `bg-gray-50` to `bg-gradient-to-br from-blue-50 to-indigo-100`
  - Increased sidebar width from `w-64` to `w-72` for better proportion
  - Enhanced spacing and padding for improved visual hierarchy
- **Main Content Area**: Added `overflow-y-auto` for independent scrolling

**Key Technical Achievements:**

- **Complete Profile System**: Full user profile management with avatar upload and fallback logic
- **UI Component Standardization**: 100% consistent form components across the application
- **Generic Hook Patterns**: Reusable hook infrastructure for complex UI interactions
- **Responsive Layout**: Proper sidebar height management with overflow handling
- **Visual Polish**: Enhanced gradient backgrounds and floating design elements
