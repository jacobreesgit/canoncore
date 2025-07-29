import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { Input } from "./input";

// Example icons for stories
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AtIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const meta: Meta<typeof Input> = {
  title: "UI/Forms/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible input component supporting multiple types, icons, validation states, and loading indicators.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["text", "email", "url", "number", "password"],
      description: "Input type",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the input",
    },
    label: {
      control: { type: "text" },
      description: "Label text for the input",
    },
    error: {
      control: { type: "text" },
      description: "Error message to display",
    },
    helpText: {
      control: { type: "text" },
      description: "Help text for additional guidance",
    },
    isLoading: {
      control: { type: "boolean" },
      description: "Shows loading state",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the input",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - Interactive input with state management
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState("");

    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Name"
        placeholder="Enter your name"
        helpText="This will be displayed on your profile"
      />
    );
  },
  parameters: {
    layout: "padded",
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 min-w-80">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Input Types</h3>
        <div className="space-y-3">
          <Input type="text" placeholder="Text input" label="Text" />
          <Input type="email" placeholder="email@example.com" label="Email" />
          <Input type="url" placeholder="https://example.com" label="URL" />
          <Input type="number" placeholder="123" label="Number" />
          <Input type="password" placeholder="Password" label="Password" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">With Icons</h3>
        <div className="space-y-3">
          <Input 
            placeholder="Search..." 
            label="Search" 
            prefixIcon={<SearchIcon />}
          />
          <Input 
            placeholder="Username" 
            label="Username" 
            prefixIcon={<UserIcon />}
          />
          <Input 
            type="email" 
            placeholder="email@domain.com" 
            label="Email" 
            prefixIcon={<AtIcon />}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 min-w-80">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Interactive States</h3>
        <div className="space-y-3">
          <Input placeholder="Default state" label="Default" />
          <Input defaultValue="With content" label="Filled" />
          <Input placeholder="Focus me" label="Focus" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Disabled States</h3>
        <div className="space-y-3">
          <Input disabled placeholder="Disabled empty" label="Disabled" />
          <Input disabled defaultValue="Disabled with content" label="Disabled filled" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Loading State</h3>
        <div className="space-y-3">
          <Input isLoading placeholder="Loading..." label="Loading" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Error State</h3>
        <div className="space-y-3">
          <Input error="This field is required" label="With error" />
          <Input error="Email format is invalid" defaultValue="invalid-email" label="Invalid input" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 min-w-80">
      <h3 className="text-sm font-semibold">Size Variants</h3>
      <div className="space-y-3">
        <Input size="sm" placeholder="Small input" label="Small" />
        <Input size="md" placeholder="Medium input" label="Medium" />
        <Input size="lg" placeholder="Large input" label="Large" />
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
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Registration Form</h3>
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <Input 
            type="text"
            placeholder="John Doe" 
            label="Full Name"
            prefixIcon={<UserIcon />}
            helpText="Enter your full legal name"
          />
          <Input 
            type="email"
            placeholder="john@example.com" 
            label="Email Address"
            prefixIcon={<AtIcon />}
            helpText="We'll never share your email"
          />
          <Input 
            type="password"
            placeholder="Create a secure password" 
            label="Password"
            helpText="Must be at least 8 characters"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Search Interface</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <Input 
            type="text"
            placeholder="Search for anything..." 
            label="Search"
            prefixIcon={<SearchIcon />}
            size="lg"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Settings Form</h3>
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <Input 
            type="url"
            placeholder="https://yourwebsite.com" 
            label="Website"
            helpText="Your personal or business website"
          />
          <Input 
            type="number"
            placeholder="25" 
            label="Age"
            helpText="Must be 18 or older"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Form Validation</h3>
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <Input 
            type="email"
            defaultValue="invalid-email"
            label="Email"
            error="Please enter a valid email address"
          />
          <Input 
            type="text"
            label="Required Field"
            error="This field is required"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

// Individual variant stories for detailed docs
export const WithLabel: Story = {
  args: {
    label: "Input with label",
    placeholder: "Enter text here",
  },
};

export const WithHelpText: Story = {
  args: {
    label: "Username",
    placeholder: "Choose a username",
    helpText: "This will be visible to other users",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    defaultValue: "invalid-email",
    error: "Please enter a valid email address",
  },
};

export const WithPrefixIcon: Story = {
  render: () => (
    <Input
      label="Search"
      placeholder="Search for anything..."
      prefixIcon={<SearchIcon />}
    />
  ),
};

// Individual type stories
export const TextInput: Story = {
  args: {
    type: "text",
    label: "Text Input",
    placeholder: "Enter some text",
  },
};

export const EmailInput: Story = {
  args: {
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
  },
};

export const PasswordInput: Story = {
  args: {
    type: "password",
    label: "Password",
    placeholder: "Enter your password",
  },
};

export const URLInput: Story = {
  args: {
    type: "url",
    label: "Website",
    placeholder: "https://example.com",
  },
};

export const NumberInput: Story = {
  args: {
    type: "number",
    label: "Age",
    placeholder: "25",
  },
};

// Individual state stories
export const Loading: Story = {
  args: {
    isLoading: true,
    label: "Loading state",
    placeholder: "Please wait...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled state",
    placeholder: "Cannot edit",
  },
};

export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    defaultValue: "Cannot edit this",
    label: "Disabled with value",
  },
};

// Individual size stories
export const Small: Story = {
  args: {
    size: "sm",
    label: "Small input",
    placeholder: "Small size",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    label: "Medium input",
    placeholder: "Medium size",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Large input",
    placeholder: "Large size",
  },
};