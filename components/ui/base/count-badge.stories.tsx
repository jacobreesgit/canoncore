import type { Meta, StoryObj } from '@storybook/nextjs'
import React from 'react'
import { CountBadge } from './count-badge'

const meta: Meta<typeof CountBadge> = {
  title: 'UI/Base/CountBadge',
  component: CountBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A specialized badge component for displaying numerical counts with configurable icons, labels, and zero-handling behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'number' },
      description: 'The numerical count to display',
    },
    icon: {
      control: { type: 'text' },
      description: 'Icon or symbol to display before the count',
    },
    label: {
      control: { type: 'text' },
      description: 'Label for tooltip and accessibility (automatically handles singular/plural)',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
      description: 'Size of the count badge',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'info', 'success', 'warning', 'danger'],
      description: 'Visual style variant of the badge',
    },
    showZero: {
      control: { type: 'boolean' },
      description: 'Whether to show the badge when count is 0 (default: hidden)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 1. Default story - Non-interactive with args
export const Default: Story = {
  args: {
    count: 5,
    icon: '•',
    label: 'items',
    size: 'sm',
    variant: 'info',
    showZero: false,
  },
}

// 2. AllVariants - All variant colors side-by-side
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CountBadge count={3} variant="primary" label="primary items" />
      <CountBadge count={5} variant="secondary" label="secondary items" />
      <CountBadge count={2} variant="info" label="info items" />
      <CountBadge count={8} variant="success" label="success items" />
      <CountBadge count={1} variant="warning" label="warning items" />
      <CountBadge count={7} variant="danger" label="danger items" />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 3. AllStates - Different count states and behaviors
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Count States</h3>
        <div className="flex flex-wrap gap-2">
          <CountBadge count={0} label="items" showZero={false} />
          <span className="text-xs text-gray-500 self-center">(0 count - hidden by default)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <CountBadge count={0} label="items" showZero={true} />
          <span className="text-xs text-gray-500 self-center">(0 count - shown with showZero)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <CountBadge count={1} label="items" />
          <span className="text-xs text-gray-500 self-center">(singular: &quot;1 item&quot;)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <CountBadge count={5} label="items" />
          <span className="text-xs text-gray-500 self-center">(plural: &quot;5 items&quot;)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <CountBadge count={99} label="notifications" />
          <span className="text-xs text-gray-500 self-center">(large numbers)</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Icon Variations</h3>
        <div className="flex flex-wrap gap-2">
          <CountBadge count={3} icon="●" label="items" />
          <CountBadge count={7} icon="★" label="items" />
          <CountBadge count={12} icon="📧" label="messages" />
          <CountBadge count={5} icon="👥" label="users" />
          <CountBadge count={2} icon="🔔" label="notifications" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Tooltip States</h3>
        <p className="text-xs text-gray-500 mb-2">Hover over badges to see tooltip with full label</p>
        <div className="flex flex-wrap gap-2">
          <CountBadge count={1} label="comments" />
          <CountBadge count={15} label="comments" />
          <CountBadge count={1} label="files" />
          <CountBadge count={8} label="files" />
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
          <CountBadge count={5} size="sm" label="items" />
          <span className="text-xs text-gray-500">Small</span>
          <CountBadge count={5} size="md" label="items" />
          <span className="text-xs text-gray-500">Medium</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">All Variants in Both Sizes</h3>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <CountBadge count={3} variant="primary" size="sm" label="items" />
            <CountBadge count={5} variant="secondary" size="sm" label="items" />
            <CountBadge count={2} variant="info" size="sm" label="items" />
            <CountBadge count={8} variant="success" size="sm" label="items" />
            <CountBadge count={1} variant="warning" size="sm" label="items" />
            <CountBadge count={7} variant="danger" size="sm" label="items" />
          </div>
          <div className="flex flex-wrap gap-2">
            <CountBadge count={3} variant="primary" size="md" label="items" />
            <CountBadge count={5} variant="secondary" size="md" label="items" />
            <CountBadge count={2} variant="info" size="md" label="items" />
            <CountBadge count={8} variant="success" size="md" label="items" />
            <CountBadge count={1} variant="warning" size="md" label="items" />
            <CountBadge count={7} variant="danger" size="md" label="items" />
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
        <h3 className="text-sm font-semibold">Navigation with Counts</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-w-sm">
          <nav className="space-y-2">
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <span className="text-sm">Inbox</span>
              <CountBadge count={12} icon="📧" label="messages" variant="primary" />
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <span className="text-sm">Drafts</span>
              <CountBadge count={3} icon="📝" label="drafts" variant="secondary" />
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <span className="text-sm">Spam</span>
              <CountBadge count={0} icon="🚫" label="spam messages" variant="warning" showZero={true} />
            </div>
          </nav>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Content Management</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Universe Overview</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Characters</span>
                <CountBadge count={24} icon="👥" label="characters" variant="info" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Locations</span>
                <CountBadge count={8} icon="📍" label="locations" variant="success" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Events</span>
                <CountBadge count={15} icon="📅" label="events" variant="primary" />
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Project Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <CountBadge count={5} icon="⏳" label="reviews" variant="warning" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <CountBadge count={42} icon="✅" label="tasks" variant="success" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Issues</span>
                <CountBadge count={2} icon="⚠️" label="issues" variant="danger" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Dashboard Cards</h3>
        <div className="grid grid-cols-3 gap-4 max-w-3xl">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="mb-2">
              <CountBadge count={156} variant="primary" size="md" label="active users" />
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="mb-2">
              <CountBadge count={89} variant="success" size="md" label="completed projects" />
            </div>
            <div className="text-sm text-gray-600">Projects Done</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="mb-2">
              <CountBadge count={7} variant="warning" size="md" label="pending tasks" />
            </div>
            <div className="text-sm text-gray-600">Pending Tasks</div>
            <div className="text-xs text-gray-500 mt-1">Require attention</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Content Lists with Counts</h3>
        <div className="border border-gray-200 rounded-lg max-w-md">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Fantasy Universe</h4>
                <p className="text-sm text-gray-600">Epic fantasy world</p>
              </div>
              <div className="flex gap-1">
                <CountBadge count={45} icon="📄" label="items" variant="info" size="sm" />
                <CountBadge count={3} icon="🔄" label="versions" variant="secondary" size="sm" />
              </div>
            </div>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sci-Fi Series</h4>
                <p className="text-sm text-gray-600">Space exploration saga</p>
              </div>
              <div className="flex gap-1">
                <CountBadge count={28} icon="📄" label="items" variant="info" size="sm" />
                <CountBadge count={1} icon="🔄" label="versions" variant="secondary" size="sm" />
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Mystery Novel</h4>
                <p className="text-sm text-gray-600">Detective story outline</p>
              </div>
              <div className="flex gap-1">
                <CountBadge count={12} icon="📄" label="items" variant="info" size="sm" />
                <CountBadge count={5} icon="🔄" label="versions" variant="secondary" size="sm" />
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
export const Primary: Story = {
  args: {
    count: 5,
    variant: 'primary',
    label: 'primary items',
  },
}

export const Secondary: Story = {
  args: {
    count: 3,
    variant: 'secondary',
    label: 'secondary items',
  },
}

export const Info: Story = {
  args: {
    count: 8,
    variant: 'info',
    label: 'info items',
  },
}

export const Success: Story = {
  args: {
    count: 12,
    variant: 'success',
    label: 'success items',
  },
}

export const Warning: Story = {
  args: {
    count: 2,
    variant: 'warning',
    label: 'warning items',
  },
}

export const Danger: Story = {
  args: {
    count: 7,
    variant: 'danger',
    label: 'danger items',
  },
}

export const Small: Story = {
  args: {
    count: 5,
    size: 'sm',
    label: 'small items',
  },
}

export const Medium: Story = {
  args: {
    count: 5,
    size: 'md',
    label: 'medium items',
  },
}

export const ZeroHidden: Story = {
  args: {
    count: 0,
    label: 'items',
    showZero: false,
  },
}

export const ZeroShown: Story = {
  args: {
    count: 0,
    label: 'items',
    showZero: true,
  },
}

export const WithCustomIcon: Story = {
  args: {
    count: 15,
    icon: '🔔',
    label: 'notifications',
    variant: 'primary',
  },
}

export const SingularPlural: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 mb-2">
        Automatic singular/plural handling - hover to see tooltips
      </div>
      <div className="flex gap-2">
        <CountBadge count={1} label="comments" />
        <CountBadge count={5} label="comments" />
        <CountBadge count={1} label="files" />
        <CountBadge count={3} label="files" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}