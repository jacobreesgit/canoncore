import type { Meta, StoryObj } from '@storybook/nextjs'
import React from 'react'
import { ActionButton } from './action-button'

const meta: Meta<typeof ActionButton> = {
  title: 'UI/Base/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states including loading state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'success', 'warning', 'info'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Shows loading spinner and disables interaction',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the button',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Makes the button take full width',
    },
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 1. Default story - Interactive demo with React hooks
export const Default: Story = {
  render: () => {
    const [isLoading, setIsLoading] = React.useState(false)
    const [clickCount, setClickCount] = React.useState(0)
    const [variant, setVariant] = React.useState<'primary' | 'success' | 'danger'>('primary')

    const handleClick = async () => {
      setIsLoading(true)
      setClickCount(prev => prev + 1)
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Cycle through variants
      if (variant === 'primary') setVariant('success')
      else if (variant === 'success') setVariant('danger')
      else setVariant('primary')
      
      setIsLoading(false)
    }

    const getButtonText = () => {
      if (isLoading) return 'Processing...'
      if (clickCount === 0) return 'Click me!'
      return `Clicked ${clickCount} time${clickCount === 1 ? '' : 's'}`
    }

    return (
      <div className="text-center">
        <ActionButton
          variant={variant}
          size="lg"
          isLoading={isLoading}
          onClick={handleClick}
        >
          {getButtonText()}
        </ActionButton>
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
      <ActionButton variant="primary">Primary</ActionButton>
      <ActionButton variant="secondary">Secondary</ActionButton>
      <ActionButton variant="danger">Danger</ActionButton>
      <ActionButton variant="success">Success</ActionButton>
      <ActionButton variant="warning">Warning</ActionButton>
      <ActionButton variant="info">Info</ActionButton>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 3. AllStates - All states side-by-side
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Default States</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary">Default</ActionButton>
          <ActionButton variant="primary" isLoading>Loading</ActionButton>
          <ActionButton variant="primary" disabled>Disabled</ActionButton>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Loading States (All Variants)</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" isLoading>Primary</ActionButton>
          <ActionButton variant="secondary" isLoading>Secondary</ActionButton>
          <ActionButton variant="danger" isLoading>Danger</ActionButton>
          <ActionButton variant="success" isLoading>Success</ActionButton>
          <ActionButton variant="warning" isLoading>Warning</ActionButton>
          <ActionButton variant="info" isLoading>Info</ActionButton>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Disabled States (All Variants)</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" disabled>Primary</ActionButton>
          <ActionButton variant="secondary" disabled>Secondary</ActionButton>
          <ActionButton variant="danger" disabled>Danger</ActionButton>
          <ActionButton variant="success" disabled>Success</ActionButton>
          <ActionButton variant="warning" disabled>Warning</ActionButton>
          <ActionButton variant="info" disabled>Info</ActionButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 4. AllSizes - All sizes side-by-side
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Size Comparison</h3>
        <div className="flex items-center gap-2">
          <ActionButton size="xs">Extra Small</ActionButton>
          <ActionButton size="sm">Small</ActionButton>
          <ActionButton size="md">Medium</ActionButton>
          <ActionButton size="lg">Large</ActionButton>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Loading Sizes</h3>
        <div className="flex items-center gap-2">
          <ActionButton size="xs" isLoading>Extra Small</ActionButton>
          <ActionButton size="sm" isLoading>Small</ActionButton>
          <ActionButton size="md" isLoading>Medium</ActionButton>
          <ActionButton size="lg" isLoading>Large</ActionButton>
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
        <h3 className="text-sm font-semibold">Form Actions</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-w-md">
          <form className="space-y-4">
            <input type="text" placeholder="Enter your name" className="w-full border border-gray-300 rounded px-3 py-2" />
            <div className="flex gap-2">
              <ActionButton variant="primary" type="submit">Save</ActionButton>
              <ActionButton variant="secondary" type="button">Cancel</ActionButton>
            </div>
          </form>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Call-to-Action Sections</h3>
        <div className="border border-gray-200 rounded-lg p-6 text-center max-w-md">
          <h4 className="font-medium mb-2">Ready to get started?</h4>
          <p className="text-sm text-gray-600 mb-4">Join thousands of users already using our platform.</p>
          <div className="space-y-2">
            <ActionButton variant="primary" size="lg" fullWidth>Get Started Free</ActionButton>
            <ActionButton variant="secondary" size="md" fullWidth>Learn More</ActionButton>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Toolbar Actions</h3>
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <ActionButton variant="primary" size="sm">Create</ActionButton>
              <ActionButton variant="secondary" size="sm">Edit</ActionButton>
              <ActionButton variant="danger" size="sm">Delete</ActionButton>
            </div>
            <ActionButton variant="info" size="sm">Export</ActionButton>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Loading States in Context</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-w-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sync Status:</span>
              <ActionButton variant="primary" size="sm" isLoading>Syncing...</ActionButton>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Deploy Status:</span>
              <ActionButton variant="success" size="sm">Deployed</ActionButton>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Build Status:</span>
              <ActionButton variant="warning" size="sm" disabled>Pending</ActionButton>
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

// 6. Individual variant stories (for detailed docs)
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
}

export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning Button',
    variant: 'warning',
  },
}

export const Info: Story = {
  args: {
    children: 'Info Button',
    variant: 'info',
  },
}

// Individual size stories (for detailed docs)
export const ExtraSmall: Story = {
  args: {
    children: 'Extra Small',
    size: 'xs',
  },
}

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
}

// Individual state stories (for detailed docs)
export const Loading: Story = {
  args: {
    children: 'Loading Button',
    isLoading: true,
    variant: 'primary',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    variant: 'primary',
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    variant: 'primary',
  },
  parameters: {
    layout: 'padded',
  },
}