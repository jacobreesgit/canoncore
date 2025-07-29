import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { RadioGroup } from "./radio-group";
import type { RadioOption } from "./radio-group";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/Forms/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible radio group component with keyboard navigation, validation states, and configurable layouts.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the radio buttons",
    },
    layout: {
      control: { type: "select" },
      options: ["vertical", "horizontal"],
      description: "Layout orientation",
    },
    name: {
      control: { type: "text" },
      description: "Name attribute for the radio group",
    },
    label: {
      control: { type: "text" },
      description: "Label text for the radio group",
    },
    error: {
      control: { type: "text" },
      description: "Error message to display",
    },
    helpText: {
      control: { type: "text" },
      description: "Help text for additional guidance",
    },
    required: {
      control: { type: "boolean" },
      description: "Marks the field as required",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the entire radio group",
    },
    isLoading: {
      control: { type: "boolean" },
      description: "Shows loading state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample options for stories
const basicOptions: RadioOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

const optionsWithDescriptions: RadioOption[] = [
  {
    value: "standard",
    label: "Standard Plan",
    description: "Perfect for individuals and small teams",
  },
  {
    value: "professional",
    label: "Professional Plan",
    description: "Advanced features for growing businesses",
  },
  {
    value: "enterprise",
    label: "Enterprise Plan",
    description: "Full-featured solution for large organizations",
  },
];

const optionsWithDisabled: RadioOption[] = [
  { value: "available1", label: "Available Option 1" },
  { value: "available2", label: "Available Option 2" },
  { value: "disabled1", label: "Disabled Option", disabled: true },
  { value: "available3", label: "Available Option 3" },
];

// Default story - Interactive radio group with state management
export const Default: Story = {
  render: () => {
    const [selectedValue, setSelectedValue] = React.useState("option2");

    return (
      <RadioGroup
        name="default-example"
        options={basicOptions}
        value={selectedValue}
        onChange={setSelectedValue}
        label="Choose an option"
        helpText="Select the option that best fits your needs"
      />
    );
  },
  parameters: {
    layout: "padded",
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => {
    const [basicValue, setBasicValue] = React.useState("option1");
    const [planValue, setPlanValue] = React.useState("professional");
    const [disabledValue, setDisabledValue] = React.useState("available1");
    const [horizontalValue, setHorizontalValue] = React.useState("option2");

    return (
      <div className="space-y-6 min-w-96">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Basic Options</h3>
          <RadioGroup
            name="variants-basic"
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
            label="Basic radio group"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">With Descriptions</h3>
          <RadioGroup
            name="variants-descriptions"
            options={optionsWithDescriptions}
            value={planValue}
            onChange={setPlanValue}
            label="Choose your plan"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">With Disabled Options</h3>
          <RadioGroup
            name="variants-disabled"
            options={optionsWithDisabled}
            value={disabledValue}
            onChange={setDisabledValue}
            label="Available options"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Horizontal Layout</h3>
          <RadioGroup
            name="variants-horizontal"
            options={basicOptions}
            value={horizontalValue}
            onChange={setHorizontalValue}
            layout="horizontal"
            label="Horizontal options"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: "padded",
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => {
    const [defaultValue, setDefaultValue] = React.useState("option1");
    const [requiredValue, setRequiredValue] = React.useState("");
    const [disabledValue, setDisabledValue] = React.useState("option2");
    const [disabledOptionsValue, setDisabledOptionsValue] = React.useState("available1");
    const [loadingValue, setLoadingValue] = React.useState("option1");
    const [errorValue, setErrorValue] = React.useState("");

    return (
      <div className="space-y-6 min-w-96">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Interactive States</h3>
          <div className="space-y-4">
            <RadioGroup
              name="states-default"
              options={basicOptions}
              value={defaultValue}
              onChange={setDefaultValue}
              label="Default state"
            />
            <RadioGroup
              name="states-required"
              options={basicOptions}
              value={requiredValue}
              onChange={setRequiredValue}
              required
              label="Required field"
              helpText="This field is required"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Disabled States</h3>
          <div className="space-y-4">
            <RadioGroup
              name="states-disabled"
              options={basicOptions}
              value={disabledValue}
              onChange={setDisabledValue}
              disabled
              label="Disabled group"
            />
            <RadioGroup
              name="states-disabled-options"
              options={optionsWithDisabled}
              value={disabledOptionsValue}
              onChange={setDisabledOptionsValue}
              label="Some options disabled"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Loading State</h3>
          <div className="space-y-4">
            <RadioGroup
              name="states-loading"
              options={basicOptions}
              value={loadingValue}
              onChange={setLoadingValue}
              isLoading
              label="Loading state"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Error State</h3>
          <div className="space-y-4">
            <RadioGroup
              name="states-error"
              options={basicOptions}
              value={errorValue}
              onChange={setErrorValue}
              error="Please select an option to continue"
              label="With error"
            />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    layout: "padded",
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => {
    const [smallValue, setSmallValue] = React.useState("option1");
    const [mediumValue, setMediumValue] = React.useState("option2");
    const [largeValue, setLargeValue] = React.useState("option3");

    return (
      <div className="space-y-6 min-w-96">
        <h3 className="text-sm font-semibold">Size Variants</h3>
        <div className="space-y-4">
          <RadioGroup
            name="sizes-small"
            options={basicOptions}
            value={smallValue}
            onChange={setSmallValue}
            size="sm"
            label="Small size"
          />
          <RadioGroup
            name="sizes-medium"
            options={basicOptions}
            value={mediumValue}
            onChange={setMediumValue}
            size="md"
            label="Medium size"
          />
          <RadioGroup
            name="sizes-large"
            options={basicOptions}
            value={largeValue}
            onChange={setLargeValue}
            size="lg"
            label="Large size"
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: "padded",
  },
};

// Usage examples - Real-world scenarios
export const UsageExamples: Story = {
  render: () => {
    const [subscriptionValue, setSubscriptionValue] = React.useState("pro");
    const [paymentValue, setPaymentValue] = React.useState("card");
    const [notificationValue, setNotificationValue] = React.useState("important");
    const [pollValue, setPollValue] = React.useState("");

    return (
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Subscription Plans</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <RadioGroup
              name="usage-subscription"
              options={[
                {
                  value: "free",
                  label: "Free Plan",
                  description: "Perfect for getting started • Up to 3 projects • Basic support",
                },
                {
                  value: "pro",
                  label: "Pro Plan - £9/month",
                  description: "For growing teams • Unlimited projects • Priority support • Advanced features",
                },
                {
                  value: "enterprise",
                  label: "Enterprise Plan",
                  description: "For large organizations • Custom pricing • Dedicated support • SLA included",
                },
              ]}
              value={subscriptionValue}
              onChange={setSubscriptionValue}
              label="Choose your subscription"
              helpText="You can change your plan at any time"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Payment Method</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <RadioGroup
              name="usage-payment"
              options={[
                {
                  value: "card",
                  label: "Credit or Debit Card",
                  description: "Visa, Mastercard, American Express",
                },
                {
                  value: "paypal",
                  label: "PayPal",
                  description: "Pay with your PayPal account",
                },
                {
                  value: "bank",
                  label: "Bank Transfer",
                  description: "Direct bank transfer (3-5 business days)",
                },
              ]}
              value={paymentValue}
              onChange={setPaymentValue}
              label="How would you like to pay?"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Notification Preferences</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <RadioGroup
              name="usage-notifications"
              options={[
                {
                  value: "all",
                  label: "All notifications",
                  description: "Get notified about everything",
                },
                {
                  value: "important",
                  label: "Important only",
                  description: "Only critical updates and security alerts",
                },
                {
                  value: "none",
                  label: "No notifications",
                  description: "Turn off all email notifications",
                },
              ]}
              value={notificationValue}
              onChange={setNotificationValue}
              layout="vertical"
              label="Email notifications"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Quick Poll</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <RadioGroup
              name="usage-poll"
              options={[
                { value: "excellent", label: "Excellent" },
                { value: "good", label: "Good" },
                { value: "average", label: "Average" },
                { value: "poor", label: "Poor" },
              ]}
              value={pollValue}
              onChange={setPollValue}
              layout="horizontal"
              label="How would you rate our service?"
              helpText="Your feedback helps us improve"
            />
          </div>
        </div>
      </div>  
    );
  },
  parameters: {
    layout: "padded",
  },
};

// Individual variant stories for detailed docs
export const WithDescriptions: Story = {
  args: {
    name: "with-descriptions",
    options: optionsWithDescriptions,
    defaultValue: "professional",
    label: "Choose your plan",
  },
};

export const WithHelpText: Story = {
  args: {
    name: "with-help",
    options: basicOptions,
    defaultValue: "option1",
    label: "Choose an option",
    helpText: "This selection will affect your account settings",
  },
};

export const WithError: Story = {
  args: {
    name: "with-error",
    options: basicOptions,
    label: "Required selection",
    error: "Please select an option to continue",
    required: true,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    name: "disabled-options",
    options: optionsWithDisabled,
    defaultValue: "available1",
    label: "Available options",
  },
};

// Individual layout stories
export const VerticalLayout: Story = {
  args: {
    name: "vertical-layout",
    options: optionsWithDescriptions,
    defaultValue: "standard",
    layout: "vertical",
    label: "Vertical layout",
  },
};

export const HorizontalLayout: Story = {
  args: {
    name: "horizontal-layout",
    options: basicOptions,
    defaultValue: "option2",
    layout: "horizontal",
    label: "Horizontal layout",
  },
};

// Individual state stories
export const Required: Story = {
  args: {
    name: "required",
    options: basicOptions,
    label: "Required field",
    required: true,
    helpText: "This field is required",
  },
};

export const Loading: Story = {
  args: {
    name: "loading",
    options: basicOptions,
    defaultValue: "option1",
    isLoading: true,
    label: "Loading state",
  },
};

export const Disabled: Story = {
  args: {
    name: "disabled",
    options: basicOptions,
    defaultValue: "option2",
    disabled: true,
    label: "Disabled state",
  },
};

// Individual size stories
export const Small: Story = {
  args: {
    name: "small",
    options: basicOptions,
    defaultValue: "option1",
    size: "sm",
    label: "Small radio group",
  },
};

export const Medium: Story = {
  args: {
    name: "medium",
    options: basicOptions,
    defaultValue: "option2",
    size: "md",
    label: "Medium radio group",
  },
};

export const Large: Story = {
  args: {
    name: "large",
    options: basicOptions,
    defaultValue: "option3",
    size: "lg",
    label: "Large radio group",
  },
};