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

## Data Model

### Core Entities

- **Universe**: User-owned container with `name`, `slug`
- **Content Items**: Hierarchical nodes with unlimited nesting
  - Properties: `title`, `description`, `item_type`, `parent_id`, `order_index`
  - Supports custom content types per universe
  - Built-in types can be disabled per universe
- **Universe Versions**: Git-like versioning with snapshots
- **Future**: Content versions, relationships (sequel/prequel/etc.)

## Database Schema (Current)

**Core Tables:**

- `universes` - User-owned content containers
- `content_items` - Hierarchical content nodes
- `custom_content_types` - Universe-specific custom types
- `disabled_content_types` - Universe-specific disabled built-in types
- `universe_versions` - Git-like versioning system
- `version_snapshots` - Complete universe state snapshots

**Planned (Phase 2.2+):**

- `content_versions` - Multiple versions per content item
- `content_links` - Relationships between content items

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

## Implementation Progress

This section tracks the current state of development. Keep this updated as work progresses.

### ✅ Completed (Phase 1 - Core Setup)

**Project Foundation:**

- ✅ Initialised Next.js 15 project with Vercel boilerplate
- ✅ Configured TypeScript with strict mode
- ✅ Set up Tailwind CSS v4 with PostCSS
- ✅ Installed Supabase CLI and dependencies

**Database & Backend:**

- ✅ Created `.env.local` with Supabase credentials
- ✅ Installed required dependencies:
  - `@supabase/supabase-js` (v2.52.0)
  - `@tanstack/react-query` (v5.83.0)
  - `zustand` (v5.0.6)
  - `uuid` and `@types/uuid`
- ✅ Created comprehensive database schema with Phase 1.6/1.7 extensions
  - Core Tables: `universes`, `content_items`, `content_versions`, `content_links`
  - Phase 1.6: `custom_content_types` (universe-specific custom types)
  - Phase 1.7: `disabled_content_types` (universe-specific built-in type disabling)
  - Row Level Security (RLS) policies for all tables
  - Indexes for performance optimization
  - Triggers for `updated_at` fields
- ✅ Set up TypeScript types (`types/database.ts`)
- ✅ Configured Supabase client (`lib/supabase.ts`)
- ✅ Set up React Query client (`lib/query-client.ts`)

**Project Structure:**

- ✅ Created directory structure:
  - `lib/` - Utilities and configurations
  - `types/` - TypeScript type definitions
  - `hooks/` - Custom React hooks
  - `components/` - Reusable UI components
  - `stores/` - Zustand state management
  - `app/universes/` - Universe-specific pages

### ✅ Completed (Phase 1 - Core Implementation)

**Authentication & Data Layer:**

- ✅ Run `supabase-schema.sql` in Supabase database
- ✅ Set up Google authentication with auth context
- ✅ Create data fetching hooks with React Query
- ✅ Set up Zustand stores for client state

**Core UI Components:**

- ✅ Create basic `ContentTree` component with hierarchical display
- ✅ Implement `AddContentModal` for creating new items
- ✅ Build `ContentDetail` panel for editing
- ✅ Add support for nested children (unlimited depth)

**Basic Functionality:**

- ✅ Implement CRUD operations for content items
- ✅ Add support for nested children (unlimited depth)
- ✅ Create universe management (create/edit/delete)
- ✅ Set up routing for `/universes/:slug`

### ✅ Phase 1 Complete - Core Platform Ready! 🎉

**Application Status:** Functional content organisation platform with Create/Read operations

- ✅ Authentication with Google OAuth via Supabase
- ✅ Universe creation and management
- ✅ Hierarchical content organisation (unlimited nesting)
- ✅ Tree-view interface with expand/collapse
- ✅ Content type categorisation (12 types: film, series, episode, etc.)
- ✅ Responsive design
- ✅ Production build successful
- ✅ Clean TypeScript implementation with strict mode
- ✅ Content item creation (C_UD - Create operation)
- ✅ Content item reading/display (\_R_UD - Read operation)

**Ready for use:** Run `canoncore` command to start development server

### ✅ Phase 1.5 Complete - Full CRUD Operations! 🎉

**Universe Management (Complete CRUD):**

- ✅ Universe editing - Update universe name/description
- ✅ Universe deletion - Delete entire universe and all content
- ✅ Proper confirmation dialogs for destructive actions

**Content Item Management (Complete CRUD):**

- ✅ Content item editing - Update title, description, type
- ✅ Content item deletion - Delete items with cascade handling
- ✅ Proper warning dialogs for nested item deletion

### ✅ Phase 1.6 Complete - Universe-Specific Custom Content Types! 🎉

**Custom Content Types System:**

- ✅ **Universe-Specific Scope** - Each universe has its own custom content types
- ✅ **Database Schema** - `custom_content_types` table with universe isolation
- ✅ **Full CRUD Operations** - Create, read, update, delete custom types
- ✅ **Emoji Support** - 50+ built-in emoji options with custom input
- ✅ **Type Management Modal** - User-friendly interface for managing custom types
- ✅ **Seamless Integration** - Custom types appear alongside built-in types
- ✅ **Visual Consistency** - Custom emojis display correctly throughout the app
- ✅ **Row Level Security** - Proper user and universe isolation via RLS policies

**Key Features:**

- **Universe Isolation**: Custom types in one universe don't appear in others
- **Built-in + Custom**: 12 built-in types + unlimited custom types per universe
- **Settings Access**: ⚙️ button in both create and edit modals for type management
- **Unique Names**: Custom type names must be unique within each universe
- **Type Display**: Custom type names and emojis shown in content tree
- **Database Security**: Universe-based RLS policies prevent cross-universe access

**Updated Database Schema:**

```sql
CREATE TABLE custom_content_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📄',
  user_id UUID NOT NULL,
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, universe_id)
);
```

**Built-in Content Types:**

- Collection 📦, Serial 📽️, Story 📖

**Application Status:** Full-featured content organisation platform with custom typing system

### ✅ Phase 1.7 Complete - Disable Built-in Content Types! 🎉

**Built-in Type Management System:**

- ✅ **Universe-Specific Disabling** - Users can disable built-in types per universe
- ✅ **Database Schema** - `disabled_content_types` table with universe isolation
- ✅ **Toggle Functionality** - Enable/disable built-in types with visual feedback
- ✅ **Comprehensive UI** - New "Manage Content Types" modal with organized sections
- ✅ **Filtered Dropdowns** - Disabled types don't appear in content creation/editing
- ✅ **Visual Indicators** - Clear red/green states for disabled/enabled types
- ✅ **Integrated Management** - Single modal for both built-in and custom type management

**Key Features:**

- **Per-Universe Control**: Disable "Film" in one universe, keep it enabled in another
- **Visual Management**: Clear enable/disable buttons with color-coded states
- **Smart Filtering**: Disabled types automatically removed from all dropdowns
- **Unified Interface**: Manage both built-in and custom types in one modal
- **Database Security**: Universe-based RLS policies prevent cross-universe access
- **Clean UI**: Organized sections for built-in vs. custom types

**Updated Database Schema:**

```sql
CREATE TABLE disabled_content_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL,
  disabled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(universe_id, content_type)
);
```

**Application Status:** Complete content organization platform with full type customization control

### ✅ Phase 1.8 Complete - UX Improvements! 🎉

**Enhanced User Experience:**

- ✅ **Universe Page Type Management** - Added "⚙️ Manage Types" button directly to universe pages
  - Available in header when content exists
  - Available in empty state alongside "Add Your First Content Item"
  - Consistent gray styling to distinguish from primary actions
- ✅ **Improved Tree Navigation** - Enhanced content tree interaction
  - Entire row clickable for items with children (not just chevron)
  - Visual feedback with cursor pointer and hover effects
  - Action buttons use event propagation prevention
  - Clear distinction between expandable and non-expandable items

**Key Features:**

- **Direct Access**: Users can manage content types without going through content modals
- **Intuitive Navigation**: Clicking anywhere on a parent item expands/collapses children
- **Better Visual Feedback**: Clear cursor and hover states indicate interactive elements
- **Non-Interfering Actions**: Edit, delete, and add child buttons work independently of expand/collapse

**Application Status:** Fully polished content organization platform with intuitive UX

- ✅ **Universe editing** - Update universe name/description
  - Edit button on universe cards with modal form
  - Implemented `useUpdateUniverse()` hook with slug regeneration
- ✅ **Universe deletion** - Delete entire universe and all content
  - Delete button with strong confirmation modal
  - Cascade delete all content items, versions, links via database constraints
  - Implemented `useDeleteUniverse()` hook

**Content Item Management (Complete CRUD):**

- ✅ **Content item editing** (CR**U**D - Update operation)
  - Edit button on tree items with modal form
  - Update title, description, and type
  - Uses existing `useUpdateContentItem()` hook
- ✅ **Content item deletion** (CRU**D** - Delete operation)
  - Delete button with confirmation modal
  - Cascade delete for children via database constraints
  - Uses existing `useDeleteContentItem()` hook

**Phase 1.5 Achievement:**
✅ **Complete CRUD operations implemented** for both universes and content items, fulfilling the original Phase 1 brief requirement: "_Implement add/edit/delete for items_"

**New Components Added:**

- `EditUniverseModal` - Universe editing form
- `DeleteUniverseModal` - Universe deletion confirmation
- `EditContentModal` - Content item editing form
- `DeleteContentModal` - Content item deletion confirmation
- Enhanced `UniverseCard` and `ContentTreeItem` with edit/delete buttons

### 📋 Phase 1.6 - Custom Content Types

**User-Defined Content Types:**

- [ ] Custom content type creation - Users can define their own content types
  - New `custom_content_types` table (user_id, name, emoji)
  - "Create Custom Type" option in content type dropdown
  - Modal form with name input and emoji picker
  - Need to implement `useCustomContentTypes()` hooks
- [ ] Custom type management - Full CRUD for custom types
  - Edit custom type name/emoji
  - Delete custom types (with usage validation)
  - Custom types available across all user's universes
- [ ] Integration with content items
  - Content items can use custom types
  - Custom types display alongside built-in types
  - Proper validation and migration support

**Phase 1.6 Goals:**
Allow users to create and manage their own content types, making the platform fully flexible for any universe structure.

### ✅ Phase 2.1 Complete - Universe Version Management System! 🎉

**Git-like Versioning System:**

- ✅ **Database Schema** - Complete universe versioning infrastructure
  - `universe_versions` table with auto-incrementing version numbers and RLS policies
  - `version_snapshots` table storing complete universe state as JSONB
  - `get_next_version_number()` function for automatic version numbering
  - Performance indexes and triggers for optimal query performance
- ✅ **Core Versioning Features** - Full git-like workflow implementation
  - Create new versions (commits) with automatic v1, v2, v3 numbering
  - Complete universe state snapshots (content items, custom types, disabled types)
  - Version switching with full state restoration from snapshots
  - Version restoration creating new versions with descriptive commit messages
  - Live version snapshot updates when content is modified
- ✅ **UI Components** - Professional version management interface
  - Version history panel with chronological version display
  - Create version modal with auto-assigned version numbers
  - Current version restrictions (no switch/restore on active version)
  - Clean version display without confusing parentheses
- ✅ **Integration** - Complete universe-wide version awareness
  - Automatic initial version (v1) creation for new universes
  - Current version snapshot updates on all content operations
  - Auto-restore last remaining version when others are deleted
  - Universe management buttons integrated into universe pages

**Key Features:**

- **Auto-Incrementing Versions**: v1, v2, v3, etc. with proper sequencing
- **Live Snapshot Updates**: Current version always reflects working state
- **Complete State Management**: Versions capture entire universe state
- **Git-like Workflow**: Work on live universe, commit to versions, switch between states
- **User-Friendly UI**: Intuitive version management with clear action restrictions
- **Production Ready**: Full RLS security, proper error handling, optimized queries

### ✅ Phase 2.2 Complete - Enhanced Tree Interaction & Content Types! 🎉

**Enhanced Tree Navigation:**

- ✅ **Clickable Content Items** - Separate content interaction from tree expansion
  - Content items clickable to navigate to dedicated content pages
  - Only chevron icons expand/collapse tree nodes (not entire row)
  - Improved visual feedback with different hover states for different interaction areas
- ✅ **Content Detail Pages** - Full page layout for content management
  - New route: `/universes/[slug]/content/[contentId]`
  - Rich information display with description, metadata, children
  - Navigation breadcrumbs and context preservation
  - Action buttons: Edit, Delete, Add Child
  - Foundation for displaying versions and relationships (Phase 2.4/2.5)

**Updated Built-in Content Types (3 types):**

- ✅ **Simplified Core Types** - Essential content organization categories
  - **Collection** 📦, **Serial** 📽️, **Story** 📖
- ✅ **Alphabetical Sorting** - All content types sorted alphabetically
  - Dropdowns (create/edit modals): All types mixed together alphabetically
  - Manage modal: Alphabetical within each section (built-in vs custom)

**User Experience Improvements:**

- ✅ **Universe Creation Flow** - Automatic navigation after creation
  - Create universe → Modal closes → Automatically navigate to new universe page
  - Smooth onboarding experience for immediate content creation

### ✅ Phase 2.3A Complete - Tree Drag & Drop System! 🎉

**Comprehensive Drag & Drop System:**

- ✅ **@dnd-kit Integration** - Modern drag & drop library with TypeScript support
- ✅ **Visual Drag Handles** - ≡ icons indicate draggable items with intuitive feedback
- ✅ **Multiple Drop Zone Types** - Flexible placement options for content reorganization
  - Before/after item placement with precise positioning
  - Child zone creation for parent-child relationships
  - Direct item dropping for hierarchical restructuring
- ✅ **Cross-Parent Movement** - Items can move between different parent containers
- ✅ **Unlimited Nesting Support** - Full tree depth support with proper order indexing
- ✅ **Visual Feedback System** - Clear drag states and colored drop zones
  - Semi-transparent drag previews during movement
  - Green drop zones with contextual text ("Add as child", "Move before", etc.)
  - Hover states and cursor feedback for interactive elements
- ✅ **Batch Database Updates** - Efficient reordering with single transaction
- ✅ **Version Snapshot Integration** - Automatic version updates after drag operations

**Key Features:**

- **useReorderContentItems() Hook** - Handles batch updates with proper SQL transactions
- **Intelligent Order Indexing** - Sequential reordering (0, 1, 2, 3...) after drag operations
- **Production Ready** - Full TypeScript integration with build compatibility
- **Performance Optimized** - Efficient tree flattening/rebuilding algorithms
- **User-Friendly** - Intuitive drag interactions with clear visual feedback

**Database Integration:**

- Batch updates for moved items and affected siblings
- Proper parent_id and order_index management
- Automatic version snapshot updates to maintain consistency
- Optimized queries to minimize database load

### 📋 Recent Bug Fixes & Improvements

**Content Creation Ordering Fix:**

- ✅ **SQL NULL Handling** - Fixed parent_id filtering for root-level content creation
  - Proper `.is('parent_id', null)` usage instead of `.eq('parent_id', null)`
  - Improved order_index calculation for new items after reordering
  - New content items now correctly appear at bottom of root level after drag operations

**Google OAuth Account Selection Fix:**

- ✅ **Force Account Selection** - Added `prompt: 'select_account'` parameter
  - Google login now always shows account selection screen after logout
  - Users can choose between multiple Google accounts each time they sign in
  - No more automatic re-login using cached credentials

**Drag & Drop UX Improvements:**

- ✅ **Full Surface Area Droppable** - Completely redesigned drop zone architecture
  - **Root items**: Entire item surface is droppable for child relationships
  - **Nested items**: Full width droppable including left padding/indented space
  - **Any nesting level**: Consistent behavior regardless of tree depth
  - **Simplified logic**: Drop ON item = child, drop BETWEEN items = reorder
  - **Clean visual feedback**: Green border highlights entire droppable area
  - **Removed complexity**: Eliminated confusing child drop zones and helper text

### ✅ Phase 2.3B Complete - Bulk Operations System! 🎉

**Comprehensive Multi-Select Content Management:**

- ✅ **Multi-Select Interface** - Professional batch operation system

  - **Selection Mode Toggle** - Clean enter/exit selection workflow
  - **Visual Checkboxes** - Checkbox controls for individual item selection
  - **Select All/Clear All** - Bulk selection management controls
  - **Selection Counter** - Real-time display of selected item count
  - **Nested Selection** - Works across all tree levels and depths

- ✅ **Bulk Move Operations** - Advanced content reorganization

  - **Destination Selection** - Modal interface for choosing move targets
  - **Circular Reference Prevention** - Smart filtering of invalid destinations
  - **Tree Depth Visualization** - Indented display of hierarchy structure
  - **Root Level Moves** - Support for moving items to top level
  - **Batch Order Management** - Proper order_index handling for multiple items

- ✅ **Batch Delete System** - Safe bulk content removal
  - **Confirmation Modal** - Clear deletion preview with item counts
  - **Child Item Warnings** - Alerts for items with nested children
  - **Total Impact Display** - Shows complete deletion scope including descendants
  - **Parallel Processing** - Efficient simultaneous deletion of multiple items
  - **Cascade Safety** - Database constraints ensure proper child cleanup

**Key Features:**

- **useBulkSelection() Hook** - Centralized selection state management
- **Smart UI States** - Context-aware button visibility and interactions
- **Drag & Drop Integration** - Bulk operations work alongside existing drag system
- **Version Compatibility** - Automatic version snapshot updates after bulk operations
- **Production Ready** - Full error handling and loading states

### ✅ Phase 2.4 Complete - Content Item Versions! 🎉

**Complete Content Version System:**

- ✅ **Version Management Hooks** - Full CRUD operations for content versions
  - `useContentVersions()` - Fetch all versions for content item
  - `useCreateContentVersion()` - Create new versions with metadata
  - `useUpdateContentVersion()` - Edit version details
  - `useDeleteContentVersion()` - Remove versions with primary handling
  - `useSetPrimaryVersion()` - Change default version
  - `usePrimaryContentVersion()` - Get primary version
  - `useContentVersionCount()` - Version count for badges
- ✅ **Version UI Components** - Professional version management interface
  - `ContentVersionsTab` - Complete versions section for content detail pages
  - `CreateContentVersionModal` - Form for creating new versions
  - `EditContentVersionModal` - Form for editing existing versions
  - `VersionSelector` - Dropdown for switching between versions
- ✅ **Integrated Version Display** - Version awareness throughout app
  - Version count badges on tree items with multiple versions
  - Versions tab in content detail pages with full CRUD
  - Primary version system with visual indicators
  - Version metadata: name, type, release date, runtime, notes

**Key Features:**

- **Primary Version System** - One version marked as default for tree display
- **Version Count Badges** - Blue badges show version count on multi-version items
- **Rich Metadata Support** - Runtime, release dates, version types, notes
- **Smart Primary Handling** - Auto-assign new primary when deleting current primary
- **Universe Integration** - Version changes update universe version snapshots
- **Production Ready** - Full TypeScript support, error handling, loading states

**Real-World Use Cases:**

- Doctor Who: "Original 6-part" vs "Omnibus Edition" vs "Cinema Version"
- Films: "Theatrical Cut" vs "Director's Cut" vs "Extended Edition"
- TV: "Original Broadcast" vs "DVD Version" vs "Streaming Cut"
- Books: "First Edition" vs "Revised Edition" vs "Author's Preferred Text"

### ✅ Phase 3.1 Complete - Component Consolidation! 🎉

**Modal System Unification:**

- ✅ **ActionButton Component** - Unified button system with 6 variants (primary, secondary, danger, success, warning, info)
- ✅ **IconButton Component** - Standardized icon buttons with 4 variants and required accessibility labels
- ✅ **Button Standardization** - Updated 50+ buttons across entire application to use unified components
- ✅ **Standard Icon Components** - Consistent SVG usage (EditIcon, DeleteIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon)

**Version Card System Overhaul:**

- ✅ **Separate Version Cards** - Created ContentVersionsCard and UniverseVersionsCard components
- ✅ **Identical Functionality** - Both cards have Set Primary, Edit, Delete operations with consistent styling
- ✅ **Improved Layout** - Vertical flexbox design with buttons below descriptions for better content flow
- ✅ **Text Overflow Fixed** - Proper break-words handling prevents content overflow
- ✅ **Unified Visual Design** - Blue theme, "Primary" badges, identical button layouts

**Enhanced Navigation:**

- ✅ **Right-click Support** - Content tree items support right-click to open in new tabs
- ✅ **Link Integration** - Proper Next.js Link components for navigation
- ✅ **Selection Mode Compatibility** - Bulk operations work alongside navigation

**Code Cleanup:**

- ✅ **Removed Unused Files** - Deleted 5 unused components and configuration files
- ✅ **Consistent Ordering** - Content versions now display newest first (matching universe versions)
- ✅ **TypeScript Improvements** - Better type safety and prop validation

### ✅ Phase 3.2 Complete - Base UI Components! 🎉

**Card Component System:**

- ✅ **Universal Card Component** - Extracted reusable Card component with consistent styling
- ✅ **Configurable Properties** - Padding options (none, sm, md, lg) and shadow options (none, sm, md, lg)
- ✅ **Complete Migration** - Replaced all `bg-white rounded-lg p-6 shadow-sm` instances across 11 components
- ✅ **Custom Styling Support** - className prop for additional styling when needed
- ✅ **Consistent Base Styling** - All cards now use consistent white background, rounded corners, and shadows

**Updated Components:**

- ✅ **Card Components** - description-card, details-card, relationships-card, universe-card, content-management-card
- ✅ **Version Cards** - content-versions-card, universe-versions-card (both main and loading states)
- ✅ **Page Components** - universe-page-client, content-detail-page-client (main content and user info cards)
- ✅ **Loading States** - Skeleton loading cards maintain consistent styling
- ✅ **Custom Cards** - Universe cards with hover effects and custom borders

**Key Benefits:**

- **Consistent Design Language** - All cards follow the same visual pattern
- **Maintainable Code** - Single source of truth for card styling
- **Flexible Configuration** - Easy to adjust padding and shadows when needed
- **Type Safety** - Full TypeScript support with proper prop validation
- **Reduced Duplication** - Eliminated repetitive styling code across components

### 📋 Next Steps

**Phase 2.5 - Content Relationships:**

- **Item Linking System** - Connect related content across hierarchy
  - Sequel/prequel/spinoff/adaptation relationships
  - **Multi-Collection Membership** - Same content appearing in multiple collections
    - Stories can belong to multiple collections simultaneously (e.g., "First Doctor" + "Tenth Doctor")
    - Shared content maintains single source of truth with multiple collection references
    - Collection views show all relevant content including shared items
  - Bidirectional relationship management
  - Relationship visualization in content detail panel

**Phase 2.6 - Dual Tree Views:**

- **Hierarchical vs. Chronological Views** - Multiple organization perspectives
  - Switch between structural hierarchy and release/production order
  - Independent ordering systems for same content
  - Timeline view with drag-and-drop chronological reordering

**Phase 3 - Code Organization:**

### ✅ Phase 3.1 Complete - Component Consolidation & Button Standardization! 🎉

**Component Analysis & Audit:**

- ✅ **Component Analysis** - Comprehensive audit of existing components for consolidation opportunities
  - Identified duplicate UI patterns across universe/content components
  - Found similar modal structures that can be unified
  - Located repeated card layouts and button patterns
  - Documented component relationships and dependencies

**Modal System Unification:**

- ✅ **Modal System Unification** - Create generic modal components
  - Already completed in previous phase - unified modal system exists
  - Common modal wrapper with consistent styling (BaseModal, FormModal, ConfirmationModal)
  - Unified create/edit modal patterns across entities
  - Consolidated confirmation dialog patterns

**Button System Standardization:**

- ✅ **ActionButton Component** - Unified button system with variant props
  - Created `ActionButton` component with variants: primary, secondary, danger, success, warning, info
  - Standardized sizes: xs, sm, md, lg with consistent padding and typography
  - Built-in loading states with spinner animation
  - Disabled states with proper visual feedback
  - Focus management and accessibility features

- ✅ **IconButton Component** - Consistent icon button patterns
  - Created `IconButton` component with variants: default, primary, danger, success
  - Standardized hover states and color transitions
  - Required aria-label for accessibility
  - Consistent sizing and padding across all icon buttons

- ✅ **Standard Icon Components** - Reusable SVG icon library
  - `EditIcon`, `DeleteIcon`, `PlusIcon`, `ChevronDownIcon`, `ChevronRightIcon`
  - Consistent sizing and stroke properties
  - Easily customizable with className props

**Component Updates:**

- ✅ **Updated Core Components** - Applied standardized buttons across the application
  - `UniverseCard` - Uses IconButton for edit/delete actions
  - `ContentTreeItem` - Uses IconButton for all tree item actions and chevrons
  - `ContentTree` - Uses ActionButton for bulk operations
  - `BulkMoveModal` - Uses ActionButton for modal actions
  - `ContentManagementCard` - Uses ActionButton for type management
  - `VersionHistoryPanel` - Uses ActionButton for version creation
  - `ContentVersionsTab` - Uses ActionButton for version management

**Key Features:**

- **Consistent Visual Language** - All buttons follow the same design patterns
- **Accessibility Compliance** - Proper ARIA labels and focus management
- **Loading State Integration** - Built-in loading spinners and disabled states
- **TypeScript Support** - Full type safety with proper prop validation
- **Maintainable Code** - Single source of truth for all button styling
- **Performance Optimized** - Reduced CSS duplication and bundle size

**Application Status:** Unified button system successfully implemented across all major components

### Phase 3.2 - UI Primitives Extraction

- [ ] **Base UI Components** - Extract fundamental building blocks

  - Card component with consistent shadow/border/padding
  - Loading states (skeletons, spinners, placeholders)
  - Badge component for version counts, status indicators
  - Icon components for consistent SVG usage

- [ ] **Form Components** - Standardized form elements

  - Input field with validation states
  - Textarea with character limits
  - Dropdown/Select with search capabilities
  - Checkbox and radio button components

- [ ] **Layout Primitives** - Reusable layout patterns
  - Stack component for consistent spacing
  - Grid layouts for responsive content
  - Sidebar patterns for consistent widths
  - Header patterns with title/actions structure

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
