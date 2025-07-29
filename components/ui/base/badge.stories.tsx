import type { Meta, StoryObj } from '@storybook/nextjs'
import React from 'react'
import { Badge, VersionBadge, StatusBadge, TypeBadge, PublicPrivateBadge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Base/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile badge component for status indicators, labels, and counts with multiple variants and specialized versions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info'],
      description: 'Visual style variant of the badge',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
      description: 'Size of the badge',
    },
    children: {
      control: { type: 'text' },
      description: 'Badge content',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with controls
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'primary',
    size: 'sm',
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Size Comparison</h3>
        <div className="flex items-center gap-2">
          <Badge size="sm">Small Badge</Badge>
          <Badge size="md">Medium Badge</Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">All Variants in Both Sizes</h3>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" size="sm">Primary SM</Badge>
            <Badge variant="secondary" size="sm">Secondary SM</Badge>
            <Badge variant="success" size="sm">Success SM</Badge>
            <Badge variant="warning" size="sm">Warning SM</Badge>
            <Badge variant="danger" size="sm">Danger SM</Badge>
            <Badge variant="info" size="sm">Info SM</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" size="md">Primary MD</Badge>
            <Badge variant="secondary" size="md">Secondary MD</Badge>
            <Badge variant="success" size="md">Success MD</Badge>
            <Badge variant="warning" size="md">Warning MD</Badge>
            <Badge variant="danger" size="md">Danger MD</Badge>
            <Badge variant="info" size="md">Info MD</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Specialized badges showcase
export const SpecializedBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Version Badges</h3>
        <div className="flex flex-wrap gap-2">
          <VersionBadge count={1} />
          <VersionBadge count={2} />
          <VersionBadge count={5} />
          <VersionBadge count={12} />
        </div>
        <p className="text-xs text-gray-500">Note: VersionBadge only shows when count &gt; 1</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Status Badges</h3>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="Active" variant="success" />
          <StatusBadge status="Pending" variant="warning" />
          <StatusBadge status="Failed" variant="danger" />
          <StatusBadge status="Draft" variant="secondary" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Type Badges</h3>
        <div className="flex flex-wrap gap-2">
          <TypeBadge type="Character" />
          <TypeBadge type="Location" />
          <TypeBadge type="Event" />
          <TypeBadge type="Organization" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Public/Private Badges</h3>
        <div className="flex flex-wrap gap-2">
          <PublicPrivateBadge isPublic={true} />
          <PublicPrivateBadge isPublic={false} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Usage examples
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">In Content Cards</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-w-md">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">The Hero&apos;s Journey</h4>
              <p className="text-sm text-gray-600">A classic narrative structure...</p>
            </div>
            <div className="flex gap-1">
              <TypeBadge type="Story Arc" />
              <PublicPrivateBadge isPublic={true} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Status Indicators</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Build Status:</span>
            <StatusBadge status="Passing" variant="success" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Review Status:</span>
            <StatusBadge status="In Progress" variant="warning" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Deploy Status:</span>
            <StatusBadge status="Failed" variant="danger" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Notification Counts</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Messages</span>
            <Badge variant="danger" size="sm">3</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Updates</span>
            <Badge variant="info" size="sm">12</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Comments</span>
            <Badge variant="warning" size="sm">5</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Individual variant stories
export const Primary: Story = {
  args: {
    children: 'Primary Badge',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Badge',
    variant: 'secondary',
  },
}

export const Success: Story = {
  args: {
    children: 'Success Badge',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning Badge',
    variant: 'warning',
  },
}

export const Danger: Story = {
  args: {
    children: 'Danger Badge',
    variant: 'danger',
  },
}

export const Info: Story = {
  args: {
    children: 'Info Badge',
    variant: 'info',
  },
}

// Individual size stories
export const Small: Story = {
  args: {
    children: 'Small Badge',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    children: 'Medium Badge',
    size: 'md',
  },
}