import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { UserAvatar } from "./user-avatar";

const meta: Meta<typeof UserAvatar> = {
  title: "UI/Base/UserAvatar",
  component: UserAvatar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "User avatar component with fallback initials, multiple sizes, and image error handling. Displays user profile pictures with automatic fallback to generated initials.",
      },
    },
    // Mock React Query to prevent errors
    msw: {
      handlers: [],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size variant',
    },
    user: {
      control: { type: 'object' },
      description: 'User data object with profile information',
    },
    userId: {
      control: { type: 'text' },
      description: 'User ID when only ID is available',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock user data for stories
const mockUsers = {
  fullUser: {
    id: '1',
    email: 'john.smith@example.com',
    username: 'johnsmith',
    full_name: 'John Smith',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  userWithoutAvatar: {
    id: '2',
    email: 'alice.johnson@example.com',
    username: 'alicejohnson',
    full_name: 'Alice Johnson',
    avatar_url: null
  },
  usernameOnly: {
    id: '3',
    email: 'bob@example.com',
    username: 'bobdeveloper',
    full_name: null,
    avatar_url: null
  },
  emailOnly: {
    id: '4',
    email: 'carol@example.com',
    username: null,
    full_name: null,
    avatar_url: null
  },
  brokenAvatar: {
    id: '5',
    email: 'dave@example.com',
    username: 'dave',
    full_name: 'Dave Wilson',
    avatar_url: 'https://broken-image-url.com/avatar.jpg'
  }
};

// Default story - For NON-INTERACTIVE component (uses args)
export const Default: Story = {
  args: {
    user: mockUsers.fullUser,
    size: 'md',
  },
};

// All sizes showcase - See all sizes together
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <UserAvatar user={mockUsers.fullUser} size="sm" />
        <p className="text-xs mt-1 text-gray-600">SM</p>
      </div>
      <div className="text-center">
        <UserAvatar user={mockUsers.fullUser} size="md" />
        <p className="text-xs mt-1 text-gray-600">MD</p>
      </div>
      <div className="text-center">
        <UserAvatar user={mockUsers.fullUser} size="lg" />
        <p className="text-xs mt-1 text-gray-600">LG</p>
      </div>
      <div className="text-center">
        <UserAvatar user={mockUsers.fullUser} size="xl" />
        <p className="text-xs mt-1 text-gray-600">XL</p>
      </div>
      <div className="text-center">
        <UserAvatar user={mockUsers.fullUser} size="2xl" />
        <p className="text-xs mt-1 text-gray-600">2XL</p>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// All states showcase - See all states together
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Avatar States</h3>
        <div className="flex flex-wrap gap-4">
          <div className="text-center">
            <UserAvatar user={mockUsers.fullUser} size="lg" />
            <p className="text-xs mt-1 text-gray-600">With Image</p>
          </div>
          <div className="text-center">
            <UserAvatar user={mockUsers.userWithoutAvatar} size="lg" />
            <p className="text-xs mt-1 text-gray-600">Full Name Initials</p>
          </div>
          <div className="text-center">
            <UserAvatar user={mockUsers.usernameOnly} size="lg" />
            <p className="text-xs mt-1 text-gray-600">Username Initials</p>
          </div>
          <div className="text-center">
            <UserAvatar user={mockUsers.emailOnly} size="lg" />
            <p className="text-xs mt-1 text-gray-600">Email Initials</p>
          </div>
          <div className="text-center">
            <UserAvatar user={mockUsers.brokenAvatar} size="lg" />
            <p className="text-xs mt-1 text-gray-600">Broken Image Fallback</p>
          </div>
          <div className="text-center">
            <UserAvatar userId="mock-id" size="lg" />
            <p className="text-xs mt-1 text-gray-600">User ID Only</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// Usage examples - Real-world scenarios
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Navigation Header</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">CanonCore</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Welcome back!</span>
              <UserAvatar user={mockUsers.fullUser} size="sm" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">User List</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            {[mockUsers.fullUser, mockUsers.userWithoutAvatar, mockUsers.usernameOnly].map((user, index) => (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                <UserAvatar user={user} size="md" />
                <div>
                  <p className="font-medium text-sm">{user.full_name || user.username || user.email}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Profile Card</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={mockUsers.fullUser} size="2xl" />
            <div>
              <h3 className="text-lg font-semibold">{mockUsers.fullUser.full_name}</h3>
              <p className="text-gray-600">@{mockUsers.fullUser.username}</p>
              <p className="text-sm text-gray-500">{mockUsers.fullUser.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// Individual size stories for detailed docs
export const Small: Story = {
  args: {
    user: mockUsers.fullUser,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    user: mockUsers.fullUser,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    user: mockUsers.fullUser,
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    user: mockUsers.fullUser,
    size: 'xl',
  },
};

export const ExtraExtraLarge: Story = {
  args: {
    user: mockUsers.fullUser,
    size: '2xl',
  },
};

// Individual state stories
export const WithImage: Story = {
  args: {
    user: mockUsers.fullUser,
    size: 'lg',
  },
};

export const WithoutImage: Story = {
  args: {
    user: mockUsers.userWithoutAvatar,
    size: 'lg',
  },
};

export const UsernameInitials: Story = {
  args: {
    user: mockUsers.usernameOnly,
    size: 'lg',
  },
};

export const EmailInitials: Story = {
  args: {
    user: mockUsers.emailOnly,
    size: 'lg',
  },
};

export const BrokenImageFallback: Story = {
  args: {
    user: mockUsers.brokenAvatar,
    size: 'lg',
  },
};

export const UserIdOnly: Story = {
  args: {
    userId: 'mock-user-id',
    size: 'lg',
  },
};

// Interactive story
export const Clickable: Story = {
  render: () => {
    const [clicked, setClicked] = React.useState(false);
    
    return (
      <div className="text-center space-y-4">
        <UserAvatar 
          user={mockUsers.fullUser} 
          size="xl" 
          onClick={() => setClicked(!clicked)}
        />
        <p className="text-sm text-gray-600">
          {clicked ? 'Avatar clicked!' : 'Click the avatar'}
        </p>
      </div>
    );
  },
  parameters: {
    layout: "padded",
  },
};