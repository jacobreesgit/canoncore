import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Forms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible checkbox input component with label, description, error states, and loading indicator support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the checkbox",
    },
    label: {
      control: { type: "text" },
      description: "Label text for the checkbox",
    },
    description: {
      control: { type: "text" },
      description: "Description text below the label",
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
      description: "Disables the checkbox",
    },
    checked: {
      control: { type: "boolean" },
      description: "Checked state of the checkbox",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - Interactive checkbox with state management
export const Default: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);

    return (
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        label="Accept terms and conditions"
        description="By checking this box, you agree to our terms of service"
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
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">With Labels</h3>
        <div className="space-y-3">
          <Checkbox defaultChecked label="Basic checkbox" />
          <Checkbox defaultChecked label="With description" description="Additional information about this option" />
          <Checkbox defaultChecked label="With help text" helpText="This provides extra guidance" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Without Labels</h3>
        <div className="flex gap-3 items-center">
          <Checkbox defaultChecked />
          <Checkbox />
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
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Interactive States</h3>
        <div className="space-y-3">
          <Checkbox label="Unchecked" />
          <Checkbox defaultChecked label="Checked" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Disabled States</h3>
        <div className="space-y-3">
          <Checkbox disabled label="Disabled unchecked" />
          <Checkbox disabled defaultChecked label="Disabled checked" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Loading State</h3>
        <div className="space-y-3">
          <Checkbox isLoading label="Loading state" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Error State</h3>
        <div className="space-y-3">
          <Checkbox error="This field is required" label="With error" />
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
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Size Variants</h3>
      <div className="flex items-center gap-6">
        <Checkbox size="sm" defaultChecked label="Small" />
        <Checkbox size="md" defaultChecked label="Medium" />
        <Checkbox size="lg" defaultChecked label="Large" />
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
        <h3 className="text-sm font-semibold">Settings Form</h3>
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <Checkbox 
            defaultChecked 
            label="Email notifications" 
            description="Receive updates about your account activity"
          />
          <Checkbox 
            label="Marketing emails" 
            description="Get newsletters and promotional content"
          />
          <Checkbox 
            defaultChecked 
            label="Security alerts" 
            description="Important notifications about your account security"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Terms Acceptance</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <Checkbox 
            label="I agree to the Terms of Service" 
            description="Please read our terms before continuing"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Bulk Selection</h3>
        <div className="border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="space-y-2">
            <Checkbox defaultChecked label="Document 1.pdf" />
            <Checkbox defaultChecked label="Document 2.pdf" />
            <Checkbox defaultChecked label="Document 3.pdf" />
            <Checkbox label="Document 4.pdf" />
            <Checkbox label="Document 5.pdf" />
          </div>
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
    label: "Checkbox with label",
    defaultChecked: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: "Enable notifications",
    description: "Get notified about important updates",
    defaultChecked: true,
  },
};

export const WithHelpText: Story = {
  args: {
    label: "Advanced setting",
    helpText: "This option affects system performance",
    defaultChecked: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Required field",
    error: "You must accept the terms to continue",
  },
};

// Individual state stories
export const Checked: Story = {
  args: {
    defaultChecked: true,
    label: "Checked state",
  },
};

export const Unchecked: Story = {
  args: {
    label: "Unchecked state",
  },
};


export const Loading: Story = {
  args: {
    isLoading: true,
    label: "Loading state",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled state",
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
    label: "Disabled checked state",
  },
};

// Individual size stories
export const Small: Story = {
  args: {
    size: "sm",
    defaultChecked: true,
    label: "Small checkbox",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    defaultChecked: true,
    label: "Medium checkbox",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    defaultChecked: true,
    label: "Large checkbox",
  },
};