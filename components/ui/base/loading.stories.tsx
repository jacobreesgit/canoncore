import type { Meta, StoryObj } from '@storybook/nextjs'
import React from 'react'
import { 
  LoadingSpinner, 
  LoadingSkeleton, 
  LoadingPlaceholder, 
  LoadingCard, 
  LoadingButtonContent 
} from './loading'
import { ActionButton } from './action-button'

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/Base/Loading',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive loading system with spinners, skeletons, placeholders, and button loading states for different loading scenarios.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the loading spinner',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 1. Default story - Interactive demo with different loading scenarios
export const Default: Story = {
  render: () => {
    const [loadingState, setLoadingState] = React.useState<'idle' | 'loading' | 'skeleton' | 'placeholder'>('idle')
    const [progress, setProgress] = React.useState(0)

    const simulateLoading = (type: 'loading' | 'skeleton' | 'placeholder') => {
      setLoadingState(type)
      setProgress(0)
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setLoadingState('idle')
            return 0
          }
          return prev + 10
        })
      }, 200)
    }

    return (
      <div className="space-y-6 w-full max-w-md">
        <div className="text-center space-y-4">
          <div className="flex gap-2 justify-center">
            <ActionButton 
              variant="primary" 
              size="sm"
              onClick={() => simulateLoading('loading')}
              disabled={loadingState !== 'idle'}
            >
              Spinner Demo
            </ActionButton>
            <ActionButton 
              variant="secondary" 
              size="sm"
              onClick={() => simulateLoading('skeleton')}
              disabled={loadingState !== 'idle'}
            >
              Skeleton Demo
            </ActionButton>
            <ActionButton 
              variant="info" 
              size="sm"
              onClick={() => simulateLoading('placeholder')}
              disabled={loadingState !== 'idle'}
            >
              Placeholder Demo
            </ActionButton>
          </div>
          
          {progress > 0 && progress < 100 && (
            <div className="text-sm text-gray-600">
              Loading progress: {progress}%
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
          {loadingState === 'idle' && (
            <div className="text-center text-gray-500">
              <div className="text-sm">Click a button above to see different loading states</div>
            </div>
          )}
          
          {loadingState === 'loading' && (
            <div className="text-center">
              <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
              <div className="text-sm text-gray-600">Loading content...</div>
            </div>
          )}
          
          {loadingState === 'skeleton' && (
            <div className="w-full space-y-4">
              <LoadingCard showTitle={true} lines={3} />
              <LoadingCard showTitle={false} lines={2} />
            </div>
          )}
          
          {loadingState === 'placeholder' && (
            <LoadingPlaceholder 
              title="Loading your content"
              message="Please wait while we fetch your data..."
            />
          )}
        </div>
      </div>
    )
  },
  parameters: {
    layout: 'padded',
  },
}

// 2. AllVariants - All loading component types
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 max-w-4xl">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Spinners</h3>
        <div className="flex items-center gap-4">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Skeletons</h3>
        <div className="space-y-2">
          <LoadingSkeleton width="w-full" height="h-4" />
          <LoadingSkeleton width="w-3/4" height="h-3" />
          <LoadingSkeleton width="w-1/2" height="h-3" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Loading Cards</h3>
        <LoadingCard showTitle={true} lines={3} />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Button Loading</h3>
        <div className="space-y-2">
          <ActionButton variant="primary" isLoading>
            Saving Changes
          </ActionButton>
          <ActionButton variant="secondary" isLoading size="sm">
            Processing
          </ActionButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 3. AllStates - Different loading states and contexts
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Spinner States</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" className="text-gray-400" />
            <span className="text-sm text-gray-500">Default gray</span>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" className="text-blue-600" />
            <span className="text-sm text-gray-500">Primary blue</span>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" className="text-green-600" />
            <span className="text-sm text-gray-500">Success green</span>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" className="text-red-600" />
            <span className="text-sm text-gray-500">Danger red</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Skeleton Variations</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Text lines</div>
            <LoadingSkeleton width="w-full" height="h-4" />
            <LoadingSkeleton width="w-4/5" height="h-4" />
            <LoadingSkeleton width="w-2/3" height="h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Title</div>
            <LoadingSkeleton width="w-1/3" height="h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Avatar</div>
            <LoadingSkeleton width="w-10" height="h-10" rounded={true} />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Button</div>
            <LoadingSkeleton width="w-20" height="h-8" rounded={true} />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Loading Card Variations</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <LoadingCard showTitle={true} lines={1} />
          <LoadingCard showTitle={true} lines={2} />
          <LoadingCard showTitle={false} lines={3} />
          <LoadingCard showTitle={true} lines={4} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 4. AllSizes - Size comparison for spinners
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Spinner Size Comparison</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <LoadingSpinner size="sm" />
            <div className="text-xs text-gray-500 mt-2">Small (16px)</div>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" />
            <div className="text-xs text-gray-500 mt-2">Medium (24px)</div>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <div className="text-xs text-gray-500 mt-2">Large (32px)</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Skeleton Size Variations</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Small text (h-3)</div>
            <LoadingSkeleton width="w-full" height="h-3" />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Regular text (h-4)</div>
            <LoadingSkeleton width="w-full" height="h-4" />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Large text (h-6)</div>
            <LoadingSkeleton width="w-full" height="h-6" />
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Heading (h-8)</div>
            <LoadingSkeleton width="w-1/2" height="h-8" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 5. UsageExamples - Real-world loading scenarios
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Content Loading</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Universe Content</h4>
              <LoadingSpinner size="sm" className="text-blue-600" />
            </div>
            <div className="space-y-3">
              <LoadingCard showTitle={true} lines={2} />
              <LoadingCard showTitle={true} lines={1} />
              <LoadingCard showTitle={false} lines={3} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Form Submission</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" value="Character Profile" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border border-gray-300 rounded px-3 py-2 h-20" value="Detailed character background..." readOnly />
            </div>
            <div className="flex gap-2">
              <ActionButton variant="primary" isLoading disabled>
                Saving...
              </ActionButton>
              <ActionButton variant="secondary" disabled>
                Cancel
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Dashboard Loading</h3>
        <div className="grid grid-cols-3 gap-4 max-w-3xl">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Active Projects</h4>
              <LoadingSpinner size="sm" className="text-gray-400" />
            </div>
            <LoadingSkeleton width="w-16" height="h-8" className="mb-2" />
            <LoadingSkeleton width="w-20" height="h-3" />
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Team Members</h4>
              <LoadingSpinner size="sm" className="text-gray-400" />
            </div>
            <LoadingSkeleton width="w-12" height="h-8" className="mb-2" />
            <LoadingSkeleton width="w-24" height="h-3" />
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Storage Used</h4>
              <LoadingSpinner size="sm" className="text-gray-400" />
            </div>
            <LoadingSkeleton width="w-20" height="h-8" className="mb-2" />
            <LoadingSkeleton width="w-16" height="h-3" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Empty State with Loading</h3>
        <div className="border border-gray-200 rounded-lg">
          <LoadingPlaceholder 
            title="Loading your universes..."
            message="This might take a moment while we fetch your content."
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Table Loading</h3>
        <div className="border border-gray-200 rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Content Items</h4>
              <LoadingSpinner size="sm" className="text-blue-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <LoadingSkeleton width="w-1/3" height="h-4" />
                    <LoadingSkeleton width="w-1/2" height="h-3" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <LoadingSkeleton width="w-6" height="h-6" />
                    <LoadingSkeleton width="w-6" height="h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Button Loading States</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" isLoading>
            Save Changes
          </ActionButton>
          <ActionButton variant="secondary" isLoading size="sm">
            Export Data
          </ActionButton>
          <ActionButton variant="danger" isLoading size="lg">
            Delete Universe
          </ActionButton>
          <ActionButton variant="success" isLoading>
            Publish Content
          </ActionButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// 6. Individual stories (for detailed docs)
export const SmallSpinner: Story = {
  args: {
    size: 'sm',
  },
}

export const MediumSpinner: Story = {
  args: {
    size: 'md',
  },
}

export const LargeSpinner: Story = {
  args: {
    size: 'lg',
  },
}

export const ColoredSpinner: Story = {
  render: () => (
    <div className="flex gap-4">
      <LoadingSpinner size="md" className="text-blue-600" />
      <LoadingSpinner size="md" className="text-green-600" />
      <LoadingSpinner size="md" className="text-red-600" />
      <LoadingSpinner size="md" className="text-purple-600" />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Skeleton component stories
export const BasicSkeleton: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <LoadingSkeleton width="w-full" height="h-4" />
      <LoadingSkeleton width="w-3/4" height="h-4" />
      <LoadingSkeleton width="w-1/2" height="h-4" />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

export const SkeletonShapes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="text-sm text-gray-500 mb-2">Text blocks</div>
      <LoadingSkeleton width="w-full" height="h-4" />
      <LoadingSkeleton width="w-4/5" height="h-4" />
      
      <div className="text-sm text-gray-500 mb-2 mt-6">Circular (avatars)</div>
      <div className="flex gap-2">
        <LoadingSkeleton width="w-8" height="h-8" rounded={true} className="rounded-full" />
        <LoadingSkeleton width="w-10" height="h-10" rounded={true} className="rounded-full" />
        <LoadingSkeleton width="w-12" height="h-12" rounded={true} className="rounded-full" />
      </div>
      
      <div className="text-sm text-gray-500 mb-2 mt-6">Buttons</div>
      <div className="flex gap-2">
        <LoadingSkeleton width="w-20" height="h-8" />
        <LoadingSkeleton width="w-24" height="h-10" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Placeholder component stories
export const BasicPlaceholder: Story = {
  render: () => (
    <LoadingPlaceholder 
      title="Loading content..."
      message="Please wait while we fetch your data."
    />
  ),
  parameters: {
    layout: 'padded',
  },
}

export const PlaceholderVariations: Story = {
  render: () => (
    <div className="space-y-8">
      <LoadingPlaceholder title="Loading..." />
      
      <LoadingPlaceholder 
        title="Fetching your universes"
        message="This might take a moment."
      />
      
      <LoadingPlaceholder 
        title="Processing your request"
        message="We're working hard to get your content ready. Thank you for your patience."
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Loading card stories
export const BasicLoadingCard: Story = {
  render: () => (
    <div className="max-w-md">
      <LoadingCard showTitle={true} lines={3} />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

export const LoadingCardVariations: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <LoadingCard showTitle={true} lines={1} />
      <LoadingCard showTitle={true} lines={2} />
      <LoadingCard showTitle={false} lines={3} />
      <LoadingCard showTitle={true} lines={4} />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}