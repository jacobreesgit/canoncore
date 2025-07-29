import type { Meta, StoryObj } from '@storybook/nextjs'
import React from 'react'
import { 
  IconButton, 
  EditIcon, 
  DeleteIcon, 
  PlusIcon, 
  ChevronDownIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  DragHandleIcon,
  EyeIcon,
  EyeOffIcon,
  MenuIcon,
  CloseIcon
} from './icon-button'

const meta: Meta<typeof IconButton> = {
  title: 'UI/Base/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A compact button component designed for icon-only actions with accessibility-first design and built-in icon components.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'danger', 'success'],
      description: 'Visual style variant of the icon button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the icon button padding',
    },
    'aria-label': {
      control: { type: 'text' },
      description: 'Required accessibility label describing the button action',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the button',
    },
    children: {
      control: { type: 'text' },
      description: 'Icon content (typically an SVG icon component)',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 1. Default story - Interactive demo with React hooks
export const Default: Story = {
  render: () => {
    const [isVisible, setIsVisible] = React.useState(true)
    const [clickCount, setClickCount] = React.useState(0)
    const [currentVariant, setCurrentVariant] = React.useState<'default' | 'primary' | 'danger' | 'success'>('default')

    const handleToggleVisibility = () => {
      setIsVisible(!isVisible)
      setClickCount(prev => prev + 1)
      
      // Cycle through variants on click
      const variants: Array<'default' | 'primary' | 'danger' | 'success'> = ['default', 'primary', 'danger', 'success']
      const currentIndex = variants.indexOf(currentVariant)
      const nextIndex = (currentIndex + 1) % variants.length
      setCurrentVariant(variants[nextIndex])
    }

    return (
      <div className="flex items-center gap-4">
        <IconButton
          variant={currentVariant}
          size="md"
          onClick={handleToggleVisibility}
          aria-label={isVisible ? 'Hide content' : 'Show content'}
        >
          {isVisible ? <EyeIcon /> : <EyeOffIcon />}
        </IconButton>
        
        <div className="text-sm text-gray-600">
          {isVisible ? 'Content is visible' : 'Content is hidden'}
          {clickCount > 0 && ` (clicked ${clickCount} times)`}
        </div>
      </div>
    )
  },
  parameters: {
    layout: 'padded',
  },
}

// 2. AllVariants - All variants side-by-side
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <IconButton variant="default" aria-label="Default edit">
        <EditIcon />
      </IconButton>
      <IconButton variant="primary" aria-label="Primary edit">
        <EditIcon />
      </IconButton>
      <IconButton variant="danger" aria-label="Danger delete">
        <DeleteIcon />
      </IconButton>
      <IconButton variant="success" aria-label="Success add">
        <PlusIcon />
      </IconButton>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 3. AllStates - Different states and hover effects
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Default States</h3>
        <div className="flex flex-wrap gap-2">
          <IconButton variant="default" aria-label="Normal state">
            <EditIcon />
          </IconButton>
          <IconButton variant="default" disabled aria-label="Disabled state">
            <EditIcon />
          </IconButton>
        </div>
        <p className="text-xs text-gray-500">Hover over buttons to see interactive states</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">All Variants with Hover States</h3>
        <div className="grid grid-cols-4 gap-4 max-w-md">
          <div className="text-center">
            <IconButton variant="default" aria-label="Default hover">
              <EditIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">Default</div>
          </div>
          <div className="text-center">
            <IconButton variant="primary" aria-label="Primary hover">
              <PlusIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">Primary</div>
          </div>
          <div className="text-center">
            <IconButton variant="danger" aria-label="Danger hover">
              <DeleteIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">Danger</div>
          </div>
          <div className="text-center">
            <IconButton variant="success" aria-label="Success hover">
              <PlusIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">Success</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Disabled States</h3>
        <div className="flex flex-wrap gap-2">
          <IconButton variant="default" disabled aria-label="Default disabled">
            <EditIcon />
          </IconButton>
          <IconButton variant="primary" disabled aria-label="Primary disabled">
            <PlusIcon />
          </IconButton>
          <IconButton variant="danger" disabled aria-label="Danger disabled">
            <DeleteIcon />
          </IconButton>
          <IconButton variant="success" disabled aria-label="Success disabled">
            <PlusIcon />
          </IconButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 4. AllSizes - Size comparison
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Size Comparison</h3>
        <div className="flex items-center gap-2">
          <IconButton size="sm" aria-label="Small size">
            <EditIcon className="w-3 h-3" />
          </IconButton>
          <span className="text-xs text-gray-500">Small</span>
          <IconButton size="md" aria-label="Medium size">
            <EditIcon />
          </IconButton>
          <span className="text-xs text-gray-500">Medium</span>
          <IconButton size="lg" aria-label="Large size">
            <EditIcon className="w-5 h-5" />
          </IconButton>
          <span className="text-xs text-gray-500">Large</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">All Variants in Different Sizes</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">Small:</span>
            <IconButton variant="default" size="sm" aria-label="Small default">
              <EditIcon className="w-3 h-3" />
            </IconButton>
            <IconButton variant="primary" size="sm" aria-label="Small primary">
              <PlusIcon className="w-3 h-3" />
            </IconButton>
            <IconButton variant="danger" size="sm" aria-label="Small danger">
              <DeleteIcon className="w-3 h-3" />
            </IconButton>
            <IconButton variant="success" size="sm" aria-label="Small success">
              <PlusIcon className="w-3 h-3" />
            </IconButton>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">Medium:</span>
            <IconButton variant="default" size="md" aria-label="Medium default">
              <EditIcon />
            </IconButton>
            <IconButton variant="primary" size="md" aria-label="Medium primary">
              <PlusIcon />
            </IconButton>
            <IconButton variant="danger" size="md" aria-label="Medium danger">
              <DeleteIcon />
            </IconButton>
            <IconButton variant="success" size="md" aria-label="Medium success">
              <PlusIcon />
            </IconButton>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">Large:</span>
            <IconButton variant="default" size="lg" aria-label="Large default">
              <EditIcon className="w-5 h-5" />
            </IconButton>
            <IconButton variant="primary" size="lg" aria-label="Large primary">
              <PlusIcon className="w-5 h-5" />
            </IconButton>
            <IconButton variant="danger" size="lg" aria-label="Large danger">
              <DeleteIcon className="w-5 h-5" />
            </IconButton>
            <IconButton variant="success" size="lg" aria-label="Large success">
              <PlusIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 5. UsageExamples - Real-world usage scenarios
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Table Actions</h3>
        <div className="border border-gray-200 rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-sm">Content Items</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {['The Hero\'s Journey', 'Character Development', 'Plot Structure'].map((item, index) => (
              <div key={index} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item}</div>
                  <div className="text-xs text-gray-500">Story element</div>
                </div>
                <div className="flex gap-1">
                  <IconButton 
                    variant="default" 
                    size="sm" 
                    aria-label={`Edit ${item}`}
                  >
                    <EditIcon className="w-3 h-3" />
                  </IconButton>
                  <IconButton 
                    variant="danger" 
                    size="sm" 
                    aria-label={`Delete ${item}`}
                  >
                    <DeleteIcon className="w-3 h-3" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Navigation Controls</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconButton variant="default" aria-label="Previous page">
                <ChevronLeftIcon />
              </IconButton>
              <span className="text-sm text-gray-600">Page 3 of 10</span>
              <IconButton variant="default" aria-label="Next page">
                <ChevronRightIcon />
              </IconButton>
            </div>
            <IconButton variant="primary" aria-label="Add new item">
              <PlusIcon />
            </IconButton>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Collapsible Sections</h3>
        <div className="space-y-2">
          {[
            { title: 'Characters', count: 12, expanded: true },
            { title: 'Locations', count: 8, expanded: false },
            { title: 'Progress', count: 24, expanded: false }
          ].map((section, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconButton 
                    variant="default" 
                    size="sm" 
                    aria-label={section.expanded ? `Collapse ${section.title}` : `Expand ${section.title}`}
                  >
                    {section.expanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                  </IconButton>
                  <span className="font-medium text-sm">{section.title}</span>
                  <span className="text-xs text-gray-500">({section.count})</span>
                </div>
                <IconButton variant="primary" size="sm" aria-label={`Add ${section.title.toLowerCase()}`}>
                  <PlusIcon className="w-3 h-3" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Mobile Header</h3>
        <div className="border border-gray-200 rounded-lg">
          <div className="px-4 py-3 flex items-center justify-between bg-white">
            <IconButton variant="default" aria-label="Open menu">
              <MenuIcon />
            </IconButton>
            <h4 className="font-medium">CanonCore</h4>
            <IconButton variant="default" aria-label="Close">
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Content Management</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-w-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconButton variant="default" size="sm" aria-label="Drag to reorder">
                  <DragHandleIcon />
                </IconButton>
                <span className="text-sm">Chapter 1: The Beginning</span>
              </div>
              <div className="flex gap-1">
                <IconButton variant="default" size="sm" aria-label="Toggle visibility">
                  <EyeIcon className="w-3 h-3" />
                </IconButton>
                <IconButton variant="default" size="sm" aria-label="Edit chapter">
                  <EditIcon className="w-3 h-3" />
                </IconButton>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconButton variant="default" size="sm" aria-label="Drag to reorder">
                  <DragHandleIcon />
                </IconButton>
                <span className="text-sm">Chapter 2: The Journey</span>
              </div>
              <div className="flex gap-1">
                <IconButton variant="default" size="sm" aria-label="Toggle visibility">
                  <EyeOffIcon className="w-3 h-3" />
                </IconButton>
                <IconButton variant="default" size="sm" aria-label="Edit chapter">
                  <EditIcon className="w-3 h-3" />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 6. Individual stories (for detailed docs)
export const DefaultVariant: Story = {
  args: {
    children: <EditIcon />,
    variant: 'default',
    'aria-label': 'Edit item',
  },
}

export const Primary: Story = {
  args: {
    children: <PlusIcon />,
    variant: 'primary',
    'aria-label': 'Add item',
  },
}

export const Danger: Story = {
  args: {
    children: <DeleteIcon />,
    variant: 'danger',
    'aria-label': 'Delete item',
  },
}

export const Success: Story = {
  args: {
    children: <PlusIcon />,
    variant: 'success',
    'aria-label': 'Create item',
  },
}

export const Small: Story = {
  args: {
    children: <EditIcon className="w-3 h-3" />,
    size: 'sm',
    'aria-label': 'Small edit button',
  },
}

export const Medium: Story = {
  args: {
    children: <EditIcon />,
    size: 'md',
    'aria-label': 'Medium edit button',
  },
}

export const Large: Story = {
  args: {
    children: <EditIcon className="w-5 h-5" />,
    size: 'lg',
    'aria-label': 'Large edit button',
  },
}

export const Disabled: Story = {
  args: {
    children: <EditIcon />,
    disabled: true,
    'aria-label': 'Disabled edit button',
  },
}

// Built-in Icons showcase
export const BuiltInIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">All Built-in Icons</h3>
        <div className="grid grid-cols-5 gap-4 max-w-lg">
          <div className="text-center">
            <IconButton variant="default" aria-label="Edit">
              <EditIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">EditIcon</div>
          </div>
          <div className="text-center">
            <IconButton variant="danger" aria-label="Delete">
              <DeleteIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">DeleteIcon</div>
          </div>
          <div className="text-center">
            <IconButton variant="primary" aria-label="Add">
              <PlusIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">PlusIcon</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Expand">
              <ChevronDownIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">ChevronDown</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Next">
              <ChevronRightIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">ChevronRight</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Previous">
              <ChevronLeftIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">ChevronLeft</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Drag">
              <DragHandleIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">DragHandle</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Show">
              <EyeIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">EyeIcon</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Hide">
              <EyeOffIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">EyeOffIcon</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">MenuIcon</div>
          </div>
          <div className="text-center">
            <IconButton variant="default" aria-label="Close">
              <CloseIcon />
            </IconButton>
            <div className="text-xs text-gray-500 mt-1">CloseIcon</div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}