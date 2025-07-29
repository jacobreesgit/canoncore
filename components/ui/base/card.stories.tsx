import type { Meta, StoryObj } from '@storybook/nextjs'
import React from 'react'
import { Card } from './card'

const meta: Meta<typeof Card> = {
  title: 'UI/Base/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card container component with configurable padding and shadow options for organizing content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding of the card',
    },
    shadow: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Drop shadow intensity',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for clickable cards',
    },
    children: {
      control: { type: 'text' },
      description: 'Card content',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 1. Default story - Non-interactive with args
export const Default: Story = {
  args: {
    children: 'This is a card with default styling. It provides a clean container for organizing content with subtle shadows and consistent spacing.',
    padding: 'md',
    shadow: 'sm',
  },
}

// 2. AllVariants - Padding and shadow combinations
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-4xl">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Padding Variants</h3>
        <Card padding="none" shadow="sm">
          <div className="text-sm">No Padding</div>
        </Card>
        <Card padding="sm" shadow="sm">
          <div className="text-sm">Small Padding</div>
        </Card>
        <Card padding="md" shadow="sm">
          <div className="text-sm">Medium Padding</div>
        </Card>
        <Card padding="lg" shadow="sm">
          <div className="text-sm">Large Padding</div>
        </Card>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Shadow Variants</h3>
        <Card padding="md" shadow="none">
          <div className="text-sm">No Shadow</div>
        </Card>
        <Card padding="md" shadow="sm">
          <div className="text-sm">Small Shadow</div>
        </Card>
        <Card padding="md" shadow="md">
          <div className="text-sm">Medium Shadow</div>
        </Card>
        <Card padding="md" shadow="lg">
          <div className="text-sm">Large Shadow</div>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 3. AllStates - Interactive and static states
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Static vs Clickable Cards</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Card padding="md" shadow="sm">
            <div className="text-sm">
              <div className="font-medium mb-2">Static Card</div>
              <div className="text-gray-600">This card has no click handler</div>
            </div>
          </Card>
          <Card 
            padding="md" 
            shadow="sm" 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => alert('Card clicked!')}
          >
            <div className="text-sm">
              <div className="font-medium mb-2">Clickable Card</div>
              <div className="text-gray-600">This card has a click handler</div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Content States</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Card padding="md" shadow="sm">
            <div className="text-sm text-gray-500 text-center py-8">
              Empty State
            </div>
          </Card>
          <Card padding="md" shadow="sm">
            <div className="text-sm">
              <div className="font-medium mb-2">Content Loaded</div>
              <div className="text-gray-600 mb-3">
                This card contains rich content with multiple elements and proper spacing.
              </div>
              <div className="text-xs text-blue-600">Action available</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 4. AllSizes - Padding size comparison
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Padding Size Comparison</h3>
        <div className="space-y-3">
          <Card padding="none" shadow="sm" className="border">
            <div className="text-sm bg-blue-50 text-blue-800 inline-block">None (no padding)</div>
          </Card>
          <Card padding="sm" shadow="sm">
            <div className="text-sm bg-green-50 text-green-800 inline-block">Small (p-4)</div>
          </Card>
          <Card padding="md" shadow="sm">
            <div className="text-sm bg-yellow-50 text-yellow-800 inline-block">Medium (p-6)</div>
          </Card>
          <Card padding="lg" shadow="sm">
            <div className="text-sm bg-purple-50 text-purple-800 inline-block">Large (p-8)</div>
          </Card>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Shadow Depth Comparison</h3>
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <Card padding="md" shadow="none">
            <div className="text-sm font-medium">No Shadow</div>
            <div className="text-xs text-gray-500 mt-1">Flat appearance</div>
          </Card>
          <Card padding="md" shadow="sm">
            <div className="text-sm font-medium">Small Shadow</div>
            <div className="text-xs text-gray-500 mt-1">Subtle elevation</div>
          </Card>
          <Card padding="md" shadow="md">
            <div className="text-sm font-medium">Medium Shadow</div>
            <div className="text-xs text-gray-500 mt-1">Moderate elevation</div>
          </Card>
          <Card padding="md" shadow="lg">
            <div className="text-sm font-medium">Large Shadow</div>
            <div className="text-xs text-gray-500 mt-1">High elevation</div>
          </Card>
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
        <h3 className="text-sm font-semibold">Content Cards</h3>
        <div className="grid grid-cols-2 gap-4 max-w-4xl">
          <Card padding="md" shadow="sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">The Hero&apos;s Journey</h4>
              <p className="text-sm text-gray-600 mb-3">
                A classic narrative structure that follows a hero&apos;s adventure, transformation, and return.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Story Arc</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Public</span>
              </div>
            </div>
          </Card>
          <Card padding="md" shadow="sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Character Profile</h4>
              <p className="text-sm text-gray-600 mb-3">
                Detailed character background, motivations, and development throughout the story.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Character</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Private</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Dashboard Widgets</h3>
        <div className="grid grid-cols-3 gap-4 max-w-4xl">
          <Card padding="md" shadow="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">24</div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
          </Card>
          <Card padding="md" shadow="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">156</div>
              <div className="text-sm text-gray-600">Completed Tasks</div>
            </div>
          </Card>
          <Card padding="md" shadow="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Form Sections</h3>
        <div className="max-w-2xl">
          <Card padding="lg" shadow="md">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Account Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter your email" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Save Changes</button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Clickable Cards</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Card 
            padding="md" 
            shadow="sm" 
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-blue-500"
            onClick={() => alert('Navigation card clicked!')}
          >
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Universe Settings</h4>
              <p className="text-sm text-gray-600">Configure your universe properties and permissions</p>
              <div className="text-xs text-blue-600 mt-2">Click to configure →</div>
            </div>
          </Card>
          <Card 
            padding="md" 
            shadow="sm" 
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-green-500"
            onClick={() => alert('Action card clicked!')}
          >
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Export Data</h4>
              <p className="text-sm text-gray-600">Download your content in various formats</p>
              <div className="text-xs text-green-600 mt-2">Click to export →</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 6. Individual stories (for detailed docs)
export const NoPadding: Story = {
  args: {
    children: 'Card with no internal padding',
    padding: 'none',
    shadow: 'sm',
  },
}

export const SmallPadding: Story = {
  args: {
    children: 'Card with small padding',
    padding: 'sm',
    shadow: 'sm',
  },
}

export const MediumPadding: Story = {
  args: {
    children: 'Card with medium padding',
    padding: 'md',
    shadow: 'sm',
  },
}

export const LargePadding: Story = {
  args: {
    children: 'Card with large padding',
    padding: 'lg',
    shadow: 'sm',
  },
}

export const NoShadow: Story = {
  args: {
    children: 'Card with no shadow',
    padding: 'md',
    shadow: 'none',
  },
}

export const SmallShadow: Story = {
  args: {
    children: 'Card with small shadow',
    padding: 'md',
    shadow: 'sm',
  },
}

export const MediumShadow: Story = {
  args: {
    children: 'Card with medium shadow',
    padding: 'md',
    shadow: 'md',
  },
}

export const LargeShadow: Story = {
  args: {
    children: 'Card with large shadow',
    padding: 'md',
    shadow: 'lg',
  },
}

export const ClickableCard: Story = {
  args: {
    children: 'This card is clickable - check the Actions panel below to see click events',
    padding: 'md',
    shadow: 'sm',
    className: 'cursor-pointer hover:shadow-md transition-shadow',
    onClick: () => alert('Card was clicked!'),
  },
}