import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Forms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible textarea component with auto-resize, character counting, validation states, and loading indicators.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the textarea",
    },
    resize: {
      control: { type: "select" },
      options: ["none", "vertical", "both"],
      description: "Resize behavior",
    },
    label: {
      control: { type: "text" },
      description: "Label text for the textarea",
    },
    error: {
      control: { type: "text" },
      description: "Error message to display",
    },
    helpText: {
      control: { type: "text" },
      description: "Help text for additional guidance",
    },
    autoResize: {
      control: { type: "boolean" },
      description: "Automatically resize based on content",
    },
    showCharCount: {
      control: { type: "boolean" },
      description: "Show character count",
    },
    minRows: {
      control: { type: "number" },
      description: "Minimum number of rows",
    },
    maxRows: {
      control: { type: "number" },
      description: "Maximum number of rows (for auto-resize)",
    },
    maxLength: {
      control: { type: "number" },
      description: "Maximum character length",
    },
    isLoading: {
      control: { type: "boolean" },
      description: "Shows loading state",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the textarea",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - Interactive textarea with state management
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState("");

    return (
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Description"
        placeholder="Enter your description here..."
        helpText="Provide a detailed description"
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
    const [basicValue, setBasicValue] = React.useState("");
    const [autoResizeValue, setAutoResizeValue] = React.useState("This textarea will automatically resize as you type more content. Try adding multiple lines of text to see how it expands.");
    const [charCountValue, setCharCountValue] = React.useState("This textarea shows character count");
    const [limitedValue, setLimitedValue] = React.useState("Character limit example");

    return (
      <div className="space-y-6 min-w-96">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Basic Textarea</h3>
          <Textarea
            value={basicValue}
            onChange={(e) => setBasicValue(e.target.value)}
            label="Basic textarea"
            placeholder="Enter text here..."
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Auto-Resize</h3>
          <Textarea
            value={autoResizeValue}
            onChange={(e) => setAutoResizeValue(e.target.value)}
            label="Auto-resize textarea"
            placeholder="This will grow as you type..."
            autoResize
            minRows={2}
            maxRows={6}
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">With Character Count</h3>
          <Textarea
            value={charCountValue}
            onChange={(e) => setCharCountValue(e.target.value)}
            label="Character count"
            placeholder="Type something..."
            showCharCount
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">With Character Limit</h3>
          <Textarea
            value={limitedValue}
            onChange={(e) => setLimitedValue(e.target.value)}
            label="Limited textarea"
            placeholder="Maximum 100 characters..."
            maxLength={100}
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
    const [defaultValue, setDefaultValue] = React.useState("");
    const [filledValue, setFilledValue] = React.useState("This textarea has some content already filled in to demonstrate the filled state.");
    const [disabledValue, setDisabledValue] = React.useState("This content cannot be edited");
    const [loadingValue, setLoadingValue] = React.useState("Loading content...");
    const [errorValue, setErrorValue] = React.useState("This content has an error");

    return (
      <div className="space-y-6 min-w-96">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Interactive States</h3>
          <div className="space-y-4">
            <Textarea
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              label="Default state"
              placeholder="Type something..."
            />
            <Textarea
              value={filledValue}
              onChange={(e) => setFilledValue(e.target.value)}
              label="Filled state"
              placeholder="This won&apos;t show"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Disabled State</h3>
          <div className="space-y-4">
            <Textarea
              value=""
              disabled
              label="Disabled empty"
              placeholder="Cannot type here"
            />
            <Textarea
              value={disabledValue}
              onChange={(e) => setDisabledValue(e.target.value)}
              disabled
              label="Disabled with content"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Loading State</h3>
          <div className="space-y-4">
            <Textarea
              value={loadingValue}
              onChange={(e) => setLoadingValue(e.target.value)}
              isLoading
              label="Loading state"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Error State</h3>
          <div className="space-y-4">
            <Textarea
              value={errorValue}
              onChange={(e) => setErrorValue(e.target.value)}
              error="This field contains invalid content"
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
    const [smallValue, setSmallValue] = React.useState("Small textarea");
    const [mediumValue, setMediumValue] = React.useState("Medium textarea");
    const [largeValue, setLargeValue] = React.useState("Large textarea");

    return (
      <div className="space-y-6 min-w-96">
        <h3 className="text-sm font-semibold">Size Variants</h3>
        <div className="space-y-4">
          <Textarea
            value={smallValue}
            onChange={(e) => setSmallValue(e.target.value)}
            size="sm"
            label="Small size"
            placeholder="Small textarea..."
          />
          <Textarea
            value={mediumValue}
            onChange={(e) => setMediumValue(e.target.value)}
            size="md"
            label="Medium size"
            placeholder="Medium textarea..."
          />
          <Textarea
            value={largeValue}
            onChange={(e) => setLargeValue(e.target.value)}
            size="lg"
            label="Large size"
            placeholder="Large textarea..."
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
    const [commentValue, setCommentValue] = React.useState("");
    const [reviewValue, setReviewValue] = React.useState("");
    const [bioValue, setBioValue] = React.useState("I&apos;m a software developer passionate about creating intuitive user experiences. I enjoy working with modern web technologies and contributing to open source projects.");
    const [feedbackValue, setFeedbackValue] = React.useState("");

    return (
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Comment Form</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <Textarea
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              label="Add a comment"
              placeholder="Share your thoughts..."
              autoResize
              minRows={3}
              maxRows={8}
              maxLength={500}
              helpText="Be respectful and constructive in your feedback"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Product Review</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <Textarea
              value={reviewValue}
              onChange={(e) => setReviewValue(e.target.value)}
              label="Write your review"
              placeholder="Tell others about your experience with this product..."
              showCharCount
              minRows={4}
              helpText="Help others by sharing detailed and honest feedback"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Profile Bio</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <Textarea
              value={bioValue}
              onChange={(e) => setBioValue(e.target.value)}
              label="About yourself"
              placeholder="Tell us about yourself..."
              maxLength={160}
              minRows={3}
              helpText="This will be displayed on your public profile"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Feedback Form</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <Textarea
              value={feedbackValue}
              onChange={(e) => setFeedbackValue(e.target.value)}
              label="How can we improve?"
              placeholder="We&apos;d love to hear your suggestions, feature requests, or any issues you&apos;ve encountered..."
              autoResize
              minRows={4}
              maxRows={10}
              showCharCount
              helpText="Your feedback helps us build a better product"
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
export const WithLabel: Story = {
  args: {
    label: "Message",
    placeholder: "Enter your message here...",
  },
};

export const WithHelpText: Story = {
  args: {
    label: "Description",
    placeholder: "Describe your project...",
    helpText: "Provide as much detail as possible to help others understand your project",
  },
};

export const WithError: Story = {
  args: {
    label: "Content",
    defaultValue: "This content is too short",
    error: "Content must be at least 50 characters long",
  },
};

export const WithCharacterCount: Story = {
  args: {
    label: "Tweet",
    placeholder: "What&apos;s happening?",
    showCharCount: true,
    maxLength: 280,
  },
};

export const AutoResize: Story = {
  args: {
    label: "Auto-resize textarea",
    placeholder: "This textarea will grow as you type...",
    autoResize: true,
    minRows: 2,
    maxRows: 8,
  },
};

// Individual size stories
export const Small: Story = {
  args: {
    size: "sm",
    label: "Small textarea",
    placeholder: "Small size example",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    label: "Medium textarea",
    placeholder: "Medium size example",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Large textarea",
    placeholder: "Large size example",
  },
};

// Individual state stories
export const Loading: Story = {
  args: {
    isLoading: true,
    label: "Loading state",
    defaultValue: "Loading content...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled state",
    defaultValue: "This content cannot be edited",
  },
};

export const DisabledEmpty: Story = {
  args: {
    disabled: true,
    label: "Disabled empty",
    placeholder: "Cannot type here",
  },
};

// Resize variants
export const NoResize: Story = {
  args: {
    label: "No resize",
    placeholder: "This textarea cannot be resized",
    resize: "none",
  },
};

export const VerticalResize: Story = {
  args: {
    label: "Vertical resize",
    placeholder: "This textarea can be resized vertically",
    resize: "vertical",
  },
};

export const BothResize: Story = {
  args: {
    label: "Both resize",
    placeholder: "This textarea can be resized in both directions",
    resize: "both",
  },
};