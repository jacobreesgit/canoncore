# Storybook Documentation

## Overview

Storybook is the component workshop for CanonCore, providing an isolated environment to develop, test, and document UI components. It serves as the single source of truth for component states, variants, and usage patterns.

## Configuration

### Storybook 9.0.18 Setup

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4 integration
- **Port**: Development server runs on `http://localhost:6006`
- **Build Target**: Static build for deployment

### Configuration Files

- `.storybook/main.ts` - Core configuration, addons, and story locations
- `.storybook/preview.ts` - Global decorators, parameters, and styling
- Component stories located alongside components: `components/**/*.stories.tsx`

### Available Commands

```bash
npm run storybook          # Start development server
npm run build-storybook    # Build static version
```

## Story Structure

### File Naming Convention

- Stories are co-located with components: `component-name.stories.tsx`
- Follow pattern: `[ComponentName].stories.tsx`
- Place in same directory as the component

### Story Requirements

**Import Requirements:**
- ✅ **MUST** use `@storybook/nextjs` (not `@storybook/react`)
- ✅ **MUST** escape entities: `&apos;` for apostrophes, `&quot;` for quotes in JSX
- ✅ **MUST** run `npm run lint-stories` before committing

### Story Template

```typescript
import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react"; // Required for interactive stories
import { ComponentName } from "./component-name";

const meta: Meta<typeof ComponentName> = {
  title: "Category/Subcategory/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered", // or 'padded', 'fullscreen'
    docs: {
      description: {
        component: "Component description for documentation",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // Define controls for props
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - For INTERACTIVE components (buttons, forms, etc.)
export const Default: Story = {
  render: () => {
    const [state, setState] = React.useState(initialState);

    const handleInteraction = () => {
      // Handle user interaction
      setState(newState);
    };

    return (
      <ComponentName
        prop={state}
        onClick={handleInteraction}
        // other interactive props
      >
        Content
      </ComponentName>
    );
  },
  parameters: {
    layout: "padded",
  },
};

// Default story - For NON-INTERACTIVE components (badges, cards, etc.)
export const Default: Story = {
  args: {
    children: "Default Content",
    variant: "primary",
    size: "md",
  },
};

// All variants showcase - See all options together
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
      <ComponentName variant="danger">Danger</ComponentName>
      <ComponentName variant="success">Success</ComponentName>
      <ComponentName variant="warning">Warning</ComponentName>
      <ComponentName variant="info">Info</ComponentName>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// All states showcase - See all states together
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">States</h3>
        <div className="flex flex-wrap gap-2">
          <ComponentName>Default</ComponentName>
          <ComponentName isLoading>Loading</ComponentName>
          <ComponentName disabled>Disabled</ComponentName>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// All sizes showcase - See all sizes together (if applicable)
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ComponentName size="xs">Extra Small</ComponentName>
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// Individual variant stories (for detailed docs)
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Example",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Example",
  },
};

// Usage examples - Real-world scenarios (REQUIRED FOR ALL)
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Context 1</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          {/* Show component in realistic usage */}
          <ComponentName variant="primary">Example usage</ComponentName>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Context 2</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          {/* Show different usage scenario */}
          <ComponentName variant="secondary">Another example</ComponentName>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// Individual variant stories (for detailed docs)
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Example",
  },
};

// Individual state stories (for detailed docs)
export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Loading Example",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Example",
  },
};
```

## Complete Component Story Audit

**Total Components**: 78 files | **Completed**: 12 | **Remaining**: 66 components

### 🎯 UI Base Components (7 files)

**Priority: High** - Foundation components used throughout application

- ✅ `components/ui/base/action-button.tsx` - **COMPLETE**
- ✅ `components/ui/base/badge.tsx` - **COMPLETE**
- ✅ `components/ui/base/card.tsx` - **COMPLETE**
- ✅ `components/ui/base/count-badge.tsx` - **COMPLETE**
- ✅ `components/ui/base/icon-button.tsx` - **COMPLETE**
- ✅ `components/ui/base/loading.tsx` - **COMPLETE**
- ✅ `components/ui/base/user-avatar.tsx` - **COMPLETE**

### 📝 UI Forms (9 files)

**Priority: High** - User input and interaction components

- ✅ `components/ui/forms/checkbox.tsx` - **COMPLETE**
- ✅ `components/ui/forms/input.tsx` - **COMPLETE**
- ✅ `components/ui/forms/radio-group.tsx` - **COMPLETE**
- ✅ `components/ui/forms/textarea.tsx` - **COMPLETE**
- ✅ `components/ui/forms/base-modal.tsx` - **COMPLETE**
- 🔲 `components/ui/forms/confirmation-modal.tsx`
- 🔲 `components/ui/forms/entity-form-modal.tsx`
- 🔲 `components/ui/forms/form-modal.tsx`

### 📐 UI Layout (7 files)

**Priority: Medium** - Layout and structure components

- 🔲 `components/ui/layout/empty-state.tsx`
- 🔲 `components/ui/layout/grid.tsx`
- 🔲 `components/ui/layout/header.tsx`
- 🔲 `components/ui/layout/loading-wrapper.tsx`
- 🔲 `components/ui/layout/mobile-layout.tsx`
- 🔲 `components/ui/layout/responsive-header.tsx`
- 🔲 `components/ui/layout/stack.tsx`

### 🎛️ UI Controls (2 files)

**Priority: Medium** - Interactive control components

- 🔲 `components/ui/controls/select.tsx`
- 🔲 `components/ui/controls/view-toggle.tsx`

### 💬 UI Feedback (2 files)

**Priority: Medium** - User feedback and notifications

- 🔲 `components/ui/feedback/toast.tsx`
- 🔲 `components/ui/feedback/toast-container.tsx`

### 🧭 UI Navigation (1 file)

**Priority: Medium** - Navigation components

- 🔲 `components/ui/navigation/breadcrumbs.tsx`

### 🔐 Auth Components (1 file)

**Priority: Medium** - Authentication components

- 🔲 `components/auth/auth-form.tsx`

### 📄 Content Management (25 files)

**Priority: Low** - Content-specific feature components

- 🔲 `components/content/content-management-card.tsx`
- 🔲 `components/content/content-relationship-types-card.tsx`
- 🔲 `components/content/content-selector.tsx`
- 🔲 `components/content/content-tree-item.tsx`
- 🔲 `components/content/content-tree.tsx`
- 🔲 `components/content/content-versions-card.tsx`
- 🔲 `components/content/content-versions-tab.tsx`
- 🔲 `components/content/create-content-modal.tsx`
- 🔲 `components/content/create-content-version-modal.tsx`
- 🔲 `components/content/create-relationship-modal.tsx`
- 🔲 `components/content/custom-organisation-type-modal.tsx`
- 🔲 `components/content/custom-relationship-type-modal.tsx`
- 🔲 `components/content/delete-content-modal.tsx`
- 🔲 `components/content/edit-content-modal.tsx`
- 🔲 `components/content/edit-content-version-modal.tsx`
- 🔲 `components/content/edit-relationship-modal.tsx`
- 🔲 `components/content/manage-organisation-types-modal.tsx`
- 🔲 `components/content/manage-placements-modal.tsx`
- 🔲 `components/content/manage-relationship-types-modal.tsx`
- 🔲 `components/content/placement-badge.tsx`
- 🔲 `components/content/relationship-badge.tsx`
- 🔲 `components/content/relationship-form.tsx`
- 🔲 `components/content/relationship-type-selector.tsx`

### 🌌 Universe Components (6 files)

**Priority: Low** - Universe-specific feature components

- 🔲 `components/universe/create-universe-modal.tsx`
- 🔲 `components/universe/delete-universe-modal.tsx`
- 🔲 `components/universe/edit-universe-modal.tsx`
- 🔲 `components/universe/edit-universe-version-modal.tsx`
- 🔲 `components/universe/universe-card.tsx`
- 🔲 `components/universe/universe-versions-card.tsx`

### 🚨 Error Handling (2 files)

**Priority: Low** - Error boundary and fallback components

- 🔲 `components/error/error-boundary.tsx`
- 🔲 `components/error/error-fallback.tsx`

### 📦 Modal Components (4 files)

**Priority: Low** - General modal components

- 🔲 `components/modals/bulk-delete-modal.tsx`
- 🔲 `components/modals/bulk-move-modal.tsx`
- 🔲 `components/modals/create-version-modal.tsx`
- 🔲 `components/modals/delete-account-modal.tsx`

### 👤 Profile Components (1 file)

**Priority: Low** - User profile components

- 🔲 `components/profile/edit-profile-modal.tsx`

### 🤝 Shared Components (10 files)

**Priority: Medium** - Shared application components

- 🔲 `components/shared/bulk-operation-modal.tsx`
- 🔲 `components/shared/content-item-selector.tsx`
- 🔲 `components/shared/description-card.tsx`
- 🔲 `components/shared/destination-selector.tsx`
- 🔲 `components/shared/detail-page-layout.tsx`
- 🔲 `components/shared/details-card.tsx`
- 🔲 `components/shared/navigation-menu.tsx`
- 🔲 `components/shared/providers.tsx`
- 🔲 `components/shared/relationships-card.tsx`
- 🔲 `components/shared/sidebar-layout.tsx`
- 🔲 `components/shared/universe-layout.tsx`
- 🔲 `components/shared/user-profile.tsx`
- 🔲 `components/shared/version-list-view.tsx`

### 📄 Page Components (4 files)

**Priority: Low** - Full page components (may not need stories)

- 🔲 `components/pages/content-detail-page.tsx`
- 🔲 `components/pages/public-universes-page.tsx`
- 🔲 `components/pages/universe-page.tsx`
- 🔲 `components/pages/user-universes-page.tsx`

## Story Categories & Organisation

### Hierarchy Structure

```
UI/
├── Base/
│   ├── ActionButton ✅
│   ├── Badge
│   ├── Card
│   └── ...
├── Forms/
│   ├── Input
│   ├── Textarea
│   └── ...
├── Layout/
│   ├── Stack
│   ├── Grid
│   └── ...
└── ...
Features/
├── Auth/
├── Content/
├── Universe/
└── ...
Shared/
├── Navigation/
├── Layout/
└── ...
```

## Documentation Standards

### Required Story Types (EXACT ORDER FOR ALL COMPONENTS)

1. **Default** - Basic usage with controls (interactive: `render()` with hooks | non-interactive: `args`)
2. **AllVariants** - ALL variants side-by-side in one view
3. **AllStates** - ALL states side-by-side in one view (loading, disabled, etc.)
4. **AllSizes** - ALL sizes side-by-side in one view (if applicable)
5. **UsageExamples** - Real-world usage scenarios with context (REQUIRED FOR ALL)
6. **Individual Stories** - Separate stories for each variant/state/size for detailed docs

### Story Requirements

- ✅ **Visual Testing** - All visual states covered
- ✅ **Documentation** - Component description and prop documentation
- ✅ **Controls** - Interactive prop controls for testing
- ✅ **Accessibility** - ARIA attributes and keyboard navigation
- ✅ **Responsive** - Mobile and desktop variations

### Props Documentation

```typescript
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'danger'],
    description: 'Visual style variant',
  },
  size: {
    control: { type: 'select' },
    options: ['sm', 'md', 'lg'],
    description: 'Component size',
  },
  disabled: {
    control: { type: 'boolean' },
    description: 'Disables interaction',
  },
}
```

## Interactive Story Best Practices

### Making Stories Truly Interactive

**❌ BAD - Static placeholder:**

```typescript
export const Interactive: Story = {
  args: {
    children: "Click me!",
  },
  play: async ({ canvasElement }) => {
    // This does nothing for the user
  },
};
```

**✅ GOOD - Functional interaction:**

```typescript
export const Interactive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [count, setCount] = React.useState(0);

    const handleClick = async () => {
      setIsLoading(true);
      setCount((prev) => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    return (
      <ActionButton isLoading={isLoading} onClick={handleClick}>
        {isLoading ? "Loading..." : `Clicked ${count} times`}
      </ActionButton>
    );
  },
};
```

### Interactive Story Guidelines

1. **Always use `render` function** - Never just `args` for interactive stories
2. **Import React** - Required for hooks: `import React from 'react'`
3. **Use real state** - `useState`, `useEffect` for dynamic behavior
4. **Simulate real usage** - Loading states, form validation, data changes
5. **Keep it focused** - Show the component's core interactive features
6. **No debug info** - Remove click counters, status text, etc. for cleaner demo

### Common Interactive Patterns

- **Buttons**: Loading states, variant changes, click handling
- **Forms**: Validation, error states, submission
- **Modals**: Open/close, form handling
- **Toggles**: On/off states, disabled transitions
- **Data components**: Loading, error, empty states

## Development Workflow

### Creating New Stories

1. Create story file alongside component
2. Define meta configuration with proper categorisation
3. **Create Default story:**
   - **Interactive components** (buttons, forms, modals): Use `render()` with React hooks for functional interaction
   - **Non-interactive components** (badges, cards, text): Use simple `args` with Storybook controls
4. Add AllVariants, AllStates, AllSizes showcase stories
5. Add individual variant/state stories for detailed documentation
6. Document props with argTypes
7. Test accessibility and responsiveness

### ⚠️ IMPORTANT: When Adding New Components

**ALWAYS create Storybook stories when adding new components to the codebase:**

1. **Create the component** - `components/ui/[category]/component-name.tsx`
2. **Immediately create stories** - `components/ui/[category]/component-name.stories.tsx`
3. **Update component audit** - Mark as ✅ complete in this documentation
4. **Test in Storybook** - Verify all stories work: `npm run storybook`

**Never add a new component without its stories** - This ensures consistent documentation and prevents the backlog from growing.

### Story Maintenance

- Update stories when component props change
- Keep stories in sync with component behaviour
- Review stories during component refactoring
- Ensure stories cover edge cases

## Integration with CanonCore

### Design System Alignment

- Stories reflect CLAUDE.md design principles
- British English throughout documentation
- Consistent with Tailwind v4 patterns
- Mobile-first responsive approach

### Component Standards

- All UI components should have stories
- Feature components need usage examples
- Shared components need integration examples
- Modal components need interaction examples

## Best Practices

### Story Writing

- Start with realistic data and common use cases
- Include edge cases (empty states, long text, etc.)
- Test keyboard navigation and screen readers
- Verify mobile responsiveness
- Document prop combinations that don't work

### Component Testing

- Use Storybook for visual regression testing
- Test component isolation and reusability
- Verify prop validation and TypeScript integration
- Check performance with large datasets

### Documentation

- Keep component descriptions concise but complete
- Document breaking changes and migration paths
- Include usage guidelines and accessibility notes
- Link to related components and patterns

---

## Quick Reference

### Useful Claude Commands

```bash
# Start Storybook development
npm run storybook

# Create new story file
touch components/ui/[category]/[component-name].stories.tsx

# Build static Storybook
npm run build-storybook

# Lint Storybook stories (prevents common issues)
npm run lint-stories

# Find components without stories
find components -name "*.tsx" -not -name "*.stories.tsx" | grep -v index.ts
```

### Component Story Checklist (EXACT ORDER)

- [ ] **Story file created IMMEDIATELY with component** (never add component without stories)
- [ ] Meta configuration with proper title hierarchy
- [ ] **1. Default story** matches component type (interactive: `render()` with hooks | non-interactive: `args`)
- [ ] **2. AllVariants story** - Shows all variants side-by-side
- [ ] **3. AllStates story** - Shows all states side-by-side (loading, disabled, etc.)
- [ ] **4. AllSizes story** - Shows all sizes side-by-side (if applicable)
- [ ] **5. UsageExamples story** - Real-world usage scenarios with context (REQUIRED)
- [ ] **6. Individual stories** - Separate story for each variant/state/size
- [ ] Props documented with argTypes
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested
- [ ] Edge cases covered
- [ ] Documentation complete
- [ ] **Component audit updated** (marked as ✅ in storybook.md)
