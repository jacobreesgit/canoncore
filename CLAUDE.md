# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CanonCore Implementation Brief (Claude Code)

## Project Overview

Create a modern content organisation platform for expanded universes using **Vercel's Next.js Boilerplate** as the foundation. The system must remain simple, clean, and use British English throughout. All code must be production-ready with no unused code, unfinished features, placeholder logic, or TODO lists left in place.

Claude Code must use **Supabase's SQL editor via the CLI** (with automated migrations) so manual database setup is not required. Google Auth is already configured in Supabase.

* **Supabase project URL**: [https://reqrehxqjirnfcnrkqja.supabase.co](https://reqrehxqjirnfcnrkqja.supabase.co)
* **API Key (anon public)**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJlaHhxamlybmZjbnJrcWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3NjAsImV4cCI6MjA2ODg0MDc2MH0.ll70wlFUrBkgd_Lp53govTVBr3wNUSXbe6Vo8ttlkow
* **Supabase Database Password (for CLI)**: Undersand360!

---

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting

## Core Data Model

### Universe

* A container for all content.
* User-owned with authentication.
* Includes a `name` and `slug` for routing.

### Content Items (Flexible Hierarchy)

Each content item is a node with the following:

#### Basic Properties

* `title` (string): Item name.
* `description` (optional string): Brief description.
* `item_type` (enum): e.g., `film`, `book`, `episode`, `series`, `collection`.
* `universe_id` (UUID): Reference to parent universe.
* `parent_id` (nullable UUID): Parent item for hierarchy.
* `order_index` (integer): Position within siblings.
* `created_at` / `updated_at` (timestamps).

#### Versions

* Multiple versions supported (e.g., Director's Cut, Remastered).
* Each version includes `version_name`, `version_type`, `release_date`.
* One version marked as `is_primary`.

#### Links/Relationships

* Connect items across hierarchy.
* Types include `sequel`, `prequel`, `spinoff`, `companion`, `remake`, `adaptation`.
* Bidirectional relationships with optional descriptions.

#### Children

* Fully recursive nested content structure. Any content item can have children, and those children can have their own children indefinitely.
* E.g., a "Series" contains "Seasons", which contain "Episodes", and episodes can have sub-content like "Behind-the-Scenes" videos.

---

## Database Schema

Claude Code must generate SQL migrations that run directly in Supabase using the CLI.

```sql
CREATE TABLE content_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL,
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  version_name TEXT NOT NULL,
  version_type TEXT,
  release_date DATE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  to_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  link_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_item_id, to_item_id, link_type)
);
```

---

## User Interface

### Next.js Single Page Application

* Route: `/universes/:slug`
* Tree-like navigation for hierarchy.
* Drag-and-drop for reordering and restructuring.
* Must support infinite levels of nested children.

### Key Components

1. **ContentTree**: Hierarchical view with expandable nodes and drag-and-drop support.
2. **ContentDetail**: Side panel or modal for editing item details, versions, links, and children.
3. **AddContentModal**: Form for adding new items with parent selection.
4. **LinkEditor**: Manage relationships visually.

All components must avoid unused React hooks, unfinished props, placeholder UI elements, and experimental logic. Code should be kept clean and ready for deployment.

---

## Example Flows

* **Creating a TV Series**

  * Add "Breaking Bad" (type: series)
  * Add "Season 1" as a child (type: season)
  * Add episodes under "Season 1" (type: episode)
  * Add "Behind-the-Scenes" videos under specific episodes.

* **Managing Versions**

  * Create "Blade Runner" (type: film)
  * Add versions: Theatrical Cut, Director's Cut, Final Cut
  * Mark Final Cut as primary

* **Linking Content**

  * Link "The Godfather" → "The Godfather Part II" (sequel)
  * Link "Breaking Bad" → "Better Call Saul" (spinoff)

---

## Technical Stack

* **Next.js (Vercel Boilerplate)** with TypeScript
* **Supabase** (PostgreSQL + Auth + RLS)
* **React Query** for server state management
* **Zustand** for lightweight client state
* **Tailwind CSS v4** for styling (follow [PostCSS guide](https://tailwindcss.com/blog/tailwindcss-v4))

### Best Practices

* Compound components for complex UI.
* Custom hooks for logic.
* Optimistic updates for UX.
* Error boundaries and loading states.
* No TODO lists or experimental features left in code.
* British English for all UI and code.
* All SQL setup automated using Supabase CLI with `Undersand360!` as DB password.

---

## Implementation Phases

### Phase 1: Core

* Initialise project with Vercel's Next.js boilerplate.
* Set up `content_items` table using Supabase CLI.
* Build basic `ContentTree` with support for nested children.
* Implement add/edit/delete for items.

### Phase 2: Versions & Links

* Add version management.
* Implement content linking and visualisation.
* Drag-and-drop reordering.

### Phase 3: UX Polish

* Advanced tree operations (cut/copy/paste).
* Bulk operations.
* Search, filtering, and export/import support.

---

## Success Criteria

The platform must:

* Support flexible hierarchies without fixed categories.
* Allow management of multiple content versions.
* Enable linking of related items.
* Allow reorganisation of content.
* Support unlimited levels of nested children.
* Scale to large datasets efficiently.
* Have clean, production-ready code free from unused imports, hooks, or dead logic.
* Run all SQL setup via Supabase CLI without manual intervention.
* Follow Tailwind v4 PostCSS setup guide.
* Be based on Vercel's Next.js boilerplate.

## Constraints

* Codebase must remain simple and maintainable.
* British English throughout.
* Good TypeScript coverage.
* Mobile-responsive design.
* Optimised for performance with large content trees.
* No unfinished or placeholder code anywhere in the repository.

## Architecture

### File Structure
- `app/` - Next.js App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles with Tailwind and custom CSS variables
- `public/` - Static assets (SVG icons)
- `next.config.ts` - Next.js configuration (minimal setup)

### Key Technologies
- **Next.js 15** with App Router for routing and server components
- **React 19** for UI components
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** with PostCSS integration
- **Geist fonts** (Sans and Mono) loaded via next/font/google

### TypeScript Configuration
- Uses `@/*` path alias for root imports
- Strict mode enabled with incremental compilation
- Configured for Next.js plugin integration

### Styling
- Tailwind CSS v4 with custom theme configuration
- CSS custom properties for theming (light/dark mode support)
- Geist font variables integrated into Tailwind theme
- Dark mode support via `prefers-color-scheme`

## Development Notes

- The project uses Turbopack for faster development builds
- Font optimization is handled automatically by Next.js
- Dark mode is implemented using CSS custom properties and media queries
- All components are functional components using TypeScript

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
- ✅ Created comprehensive database schema (`supabase-schema.sql`)
  - Tables: `universes`, `content_items`, `content_versions`, `content_links`
  - Row Level Security (RLS) policies
  - Indexes for performance
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

**Application Status:** Fully functional content organisation platform
- ✅ Authentication with Google OAuth via Supabase
- ✅ Universe creation and management
- ✅ Hierarchical content organisation (unlimited nesting)
- ✅ Tree-view interface with expand/collapse
- ✅ Content type categorisation (12 types: film, series, episode, etc.)
- ✅ Responsive design with dark mode support
- ✅ Production build successful
- ✅ Clean TypeScript implementation with strict mode

**Ready for use:** Run `canoncore` command to start development server

### 📋 Next Steps (Phase 2 - Enhanced Features)

### 📋 Future Phases

**Phase 2: Versions & Links**
- [ ] Add version management system
- [ ] Implement content linking and relationships
- [ ] Enhanced drag-and-drop for restructuring
- [ ] Visual link editor

**Phase 3: UX Polish**
- [ ] Advanced tree operations (cut/copy/paste)
- [ ] Bulk operations
- [ ] Search and filtering
- [ ] Export/import functionality
- [ ] Performance optimisations for large datasets

### 📁 Current File Structure

```
canoncore/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Homepage with auth & universe listing
│   ├── globals.css                   # Global styles
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # OAuth callback handler
│   └── universes/
│       └── [slug]/
│           ├── page.tsx              # Server component wrapper
│           └── universe-page-client.tsx # Universe management page
├── lib/
│   ├── supabase.ts                   # Supabase client setup
│   └── query-client.ts               # React Query configuration
├── types/
│   └── database.ts                   # TypeScript database types
├── components/
│   ├── providers.tsx                 # React Query provider
│   ├── universe-card.tsx             # Universe display card
│   ├── create-universe-modal.tsx     # Universe creation form
│   ├── content-tree.tsx              # Hierarchical content display
│   ├── content-tree-item.tsx         # Individual tree item
│   └── create-content-modal.tsx      # Content item creation form
├── contexts/
│   └── auth-context.tsx              # Authentication context
├── hooks/
│   ├── use-universes.ts              # Universe CRUD operations
│   └── use-content-items.ts          # Content item CRUD operations
├── stores/                           # Zustand stores (empty)
├── supabase/
│   ├── config.toml                   # Supabase CLI configuration
│   └── migrations/
│       └── 20250723105555_initial_schema.sql # Database schema
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```