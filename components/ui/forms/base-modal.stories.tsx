import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { BaseModal } from "./base-modal";
import { ActionButton } from "../base/action-button";

const meta: Meta<typeof BaseModal> = {
  title: "UI/Forms/BaseModal",
  component: BaseModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "A flexible modal component with customizable sizes, optional close button, and keyboard navigation support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "Size of the modal",
    },
    title: {
      control: { type: "text" },
      description: "Title displayed in the modal header",
    },
    showCloseButton: {
      control: { type: "boolean" },
      description: "Whether to show the close button in the header",
    },
    isOpen: {
      control: { type: "boolean" },
      description: "Controls modal visibility",
    },
    children: {
      control: { type: "text" },
      description: "Content to display in the modal body",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - Interactive modal with state management
export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Modal
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Title"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is the modal content. You can add any content here.</p>
            <p>The modal can be closed by clicking the X button, pressing Escape, or clicking outside.</p>
            <div className="flex gap-2 pt-4">
              <ActionButton onClick={() => setIsOpen(false)}>
                Close
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </ActionButton>
            </div>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => {
    const [openModals, setOpenModals] = React.useState({
      withClose: false,
      withoutClose: false,
      longContent: false,
      form: false,
    });

    const openModal = (key: keyof typeof openModals) => {
      setOpenModals(prev => ({ ...prev, [key]: true }));
    };

    const closeModal = (key: keyof typeof openModals) => {
      setOpenModals(prev => ({ ...prev, [key]: false }));
    };

    return (
      <div className="space-y-4 p-4">
        <h3 className="text-sm font-semibold">Modal Variants</h3>
        <div className="flex flex-wrap gap-4">
          <ActionButton onClick={() => openModal('withClose')}>
            With Close Button
          </ActionButton>
          <ActionButton onClick={() => openModal('withoutClose')}>
            Without Close Button
          </ActionButton>
          <ActionButton onClick={() => openModal('longContent')}>
            Long Content
          </ActionButton>
          <ActionButton onClick={() => openModal('form')}>
            Form Modal
          </ActionButton>
        </div>

        {/* With Close Button */}
        <BaseModal
          isOpen={openModals.withClose}
          onClose={() => closeModal('withClose')}
          title="Modal with Close Button"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This modal has a close button in the header for easy dismissal.</p>
            <ActionButton onClick={() => closeModal('withClose')}>
              Done
            </ActionButton>
          </div>
        </BaseModal>

        {/* Without Close Button */}
        <BaseModal
          isOpen={openModals.withoutClose}
          onClose={() => closeModal('withoutClose')}
          title="Modal without Close Button"
          size="sm"
          showCloseButton={false}
        >
          <div className="space-y-4">
            <p>This modal doesn&apos;t have a close button. Use Escape key or click outside to close.</p>
            <ActionButton onClick={() => closeModal('withoutClose')}>
              Close Modal
            </ActionButton>
          </div>
        </BaseModal>

        {/* Long Content */}
        <BaseModal
          isOpen={openModals.longContent}
          onClose={() => closeModal('longContent')}
          title="Modal with Long Content"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This modal demonstrates scrollable content when the content exceeds the modal height.</p>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="text-sm text-gray-600">
                This is paragraph {i + 1} of the long content. It&apos;s designed to show how the modal handles scrolling when content overflows.
              </p>
            ))}
            <ActionButton onClick={() => closeModal('longContent')}>
              Close
            </ActionButton>
          </div>
        </BaseModal>

        {/* Form Modal */}
        <BaseModal
          isOpen={openModals.form}
          onClose={() => closeModal('form')}
          title="Create New Item"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-blue-500 focus-visible:border-blue-500" 
                placeholder="Enter name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-blue-500 focus-visible:border-blue-500" 
                rows={3}
                placeholder="Enter description..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <ActionButton onClick={() => closeModal('form')}>
                Create
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => closeModal('form')}>
                Cancel
              </ActionButton>
            </div>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => {
    const [openStates, setOpenStates] = React.useState({
      open: false,
      loading: false,
      error: false,
      success: false,
    });

    const openState = (key: keyof typeof openStates) => {
      setOpenStates(prev => ({ ...prev, [key]: true }));
    };

    const closeState = (key: keyof typeof openStates) => {
      setOpenStates(prev => ({ ...prev, [key]: false }));
    };

    return (
      <div className="space-y-4 p-4">
        <h3 className="text-sm font-semibold">Modal States</h3>
        <div className="flex flex-wrap gap-4">
          <ActionButton onClick={() => openState('open')}>
            Standard Modal
          </ActionButton>
          <ActionButton onClick={() => openState('loading')}>
            Loading State
          </ActionButton>
          <ActionButton onClick={() => openState('error')}>
            Error State
          </ActionButton>
          <ActionButton onClick={() => openState('success')}>
            Success State
          </ActionButton>
        </div>

        {/* Standard Open */}
        <BaseModal
          isOpen={openStates.open}
          onClose={() => closeState('open')}
          title="Standard Modal"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is a standard modal in its normal state.</p>
            <ActionButton onClick={() => closeState('open')}>
              Close
            </ActionButton>
          </div>
        </BaseModal>

        {/* Loading State */}
        <BaseModal
          isOpen={openStates.loading}
          onClose={() => closeState('loading')}
          title="Processing..."
          size="sm"
          showCloseButton={false}
        >
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p>Please wait while we process your request...</p>
            <p className="text-sm text-gray-500">This may take a few moments.</p>
          </div>
        </BaseModal>

        {/* Error State */}
        <BaseModal
          isOpen={openStates.error}
          onClose={() => closeState('error')}
          title="Error"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">Something went wrong</span>
            </div>
            <p className="text-gray-600">
              We encountered an error while processing your request. Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-2">
              <ActionButton variant="danger" onClick={() => closeState('error')}>
                Try Again
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => closeState('error')}>
                Cancel
              </ActionButton>
            </div>
          </div>
        </BaseModal>

        {/* Success State */}
        <BaseModal
          isOpen={openStates.success}
          onClose={() => closeState('success')}
          title="Success"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <span className="text-xl">✅</span>
              <span className="font-medium">Operation completed successfully</span>
            </div>
            <p className="text-gray-600">
              Your changes have been saved and are now live.
            </p>
            <ActionButton onClick={() => closeState('success')}>
              Continue
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => {
    const [openSizes, setOpenSizes] = React.useState({
      sm: false,
      md: false,
      lg: false,
      xl: false,
    });

    const openSize = (key: keyof typeof openSizes) => {
      setOpenSizes(prev => ({ ...prev, [key]: true }));
    };

    const closeSize = (key: keyof typeof openSizes) => {
      setOpenSizes(prev => ({ ...prev, [key]: false }));
    };

    return (
      <div className="space-y-4 p-4">
        <h3 className="text-sm font-semibold">Modal Sizes</h3>
        <div className="flex flex-wrap gap-4">
          <ActionButton onClick={() => openSize('sm')}>
            Small Modal
          </ActionButton>
          <ActionButton onClick={() => openSize('md')}>
            Medium Modal
          </ActionButton>
          <ActionButton onClick={() => openSize('lg')}>
            Large Modal
          </ActionButton>
          <ActionButton onClick={() => openSize('xl')}>
            Extra Large Modal
          </ActionButton>
        </div>

        {/* Small */}
        <BaseModal
          isOpen={openSizes.sm}
          onClose={() => closeSize('sm')}
          title="Small Modal"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is a small modal, perfect for simple confirmations or brief messages.</p>
            <ActionButton onClick={() => closeSize('sm')}>
              OK
            </ActionButton>
          </div>
        </BaseModal>

        {/* Medium */}
        <BaseModal
          isOpen={openSizes.md}
          onClose={() => closeSize('md')}
          title="Medium Modal"
          size="md"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is a medium modal, the default size that works well for most content.</p>
            <p>It provides a good balance between space and compactness.</p>
            <ActionButton onClick={() => closeSize('md')}>
              Close
            </ActionButton>
          </div>
        </BaseModal>

        {/* Large */}
        <BaseModal
          isOpen={openSizes.lg}
          onClose={() => closeSize('lg')}
          title="Large Modal"
          size="lg"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is a large modal, suitable for forms or content that needs more space.</p>
            <p>It provides ample room for detailed information, forms, or complex layouts.</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Example Form</h4>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Field 1" 
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <input 
                  type="text" 
                  placeholder="Field 2" 
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <ActionButton onClick={() => closeSize('lg')}>
              Close
            </ActionButton>
          </div>
        </BaseModal>

        {/* Extra Large */}
        <BaseModal
          isOpen={openSizes.xl}
          onClose={() => closeSize('xl')}
          title="Extra Large Modal"
          size="xl"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is an extra large modal, ideal for complex interfaces or detailed content.</p>
            <p>It maximizes the available space while maintaining good usability.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Left Panel</h4>
                <p className="text-sm text-gray-600">Content can be organized in multiple columns.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Right Panel</h4>
                <p className="text-sm text-gray-600">Perfect for side-by-side layouts.</p>
              </div>
            </div>
            <ActionButton onClick={() => closeSize('xl')}>
              Close
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// Usage examples - Real-world scenarios
export const UsageExamples: Story = {
  render: () => {
    const [openExamples, setOpenExamples] = React.useState({
      confirmation: false,
      settings: false,
      preview: false,
      help: false,
    });

    const openExample = (key: keyof typeof openExamples) => {
      setOpenExamples(prev => ({ ...prev, [key]: true }));
    };

    const closeExample = (key: keyof typeof openExamples) => {
      setOpenExamples(prev => ({ ...prev, [key]: false }));
    };

    return (
      <div className="space-y-8 max-w-4xl p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Confirmation Dialog</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="mb-4">Use for destructive actions that need user confirmation:</p>
            <ActionButton variant="danger" onClick={() => openExample('confirmation')}>
              Delete Account
            </ActionButton>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Settings Modal</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="mb-4">Use for configuration forms and settings panels:</p>
            <ActionButton onClick={() => openExample('settings')}>
              Open Settings
            </ActionButton>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Content Preview</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="mb-4">Use for previewing content without navigation:</p>
            <ActionButton onClick={() => openExample('preview')}>
              Preview Document
            </ActionButton>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Help & Documentation</h3>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="mb-4">Use for contextual help and documentation:</p>
            <ActionButton variant="secondary" onClick={() => openExample('help')}>
              Show Help
            </ActionButton>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <BaseModal
          isOpen={openExamples.confirmation}
          onClose={() => closeExample('confirmation')}
          title="Confirm Account Deletion"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">This action cannot be undone</span>
            </div>
            <p className="text-gray-600">
              Are you sure you want to delete your account? All your data will be permanently removed and cannot be recovered.
            </p>
            <div className="flex gap-2 pt-2">
              <ActionButton 
                variant="danger" 
                onClick={() => closeExample('confirmation')}
              >
                Delete Account
              </ActionButton>
              <ActionButton 
                variant="secondary" 
                onClick={() => closeExample('confirmation')}
              >
                Cancel
              </ActionButton>
            </div>
          </div>
        </BaseModal>

        {/* Settings Modal */}
        <BaseModal
          isOpen={openExamples.settings}
          onClose={() => closeExample('settings')}
          title="Account Settings"
          size="sm"
          showCloseButton
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Profile Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input 
                    type="text" 
                    defaultValue="John Doe"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    defaultValue="john@example.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">SMS notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Marketing updates</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <ActionButton onClick={() => closeExample('settings')}>
                Save Changes
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => closeExample('settings')}>
                Cancel
              </ActionButton>
            </div>
          </div>
        </BaseModal>

        {/* Preview Modal */}
        <BaseModal
          isOpen={openExamples.preview}
          onClose={() => closeExample('preview')}
          title="Document Preview"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Project Proposal</h4>
              <div className="prose text-sm">
                <p className="mb-3">
                  This document outlines the proposed project scope, timeline, and deliverables 
                  for the upcoming development cycle.
                </p>
                <h5 className="font-medium mb-2">Objectives</h5>
                <ul className="list-disc list-inside mb-3 space-y-1">
                  <li>Implement new user authentication system</li>
                  <li>Redesign dashboard interface</li>
                  <li>Optimize database performance</li>
                  <li>Add mobile responsive features</li>
                </ul>
                <h5 className="font-medium mb-2">Timeline</h5>
                <p className="mb-3">
                  The project is expected to take 8-10 weeks, with major milestones 
                  every 2 weeks for review and feedback.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <ActionButton onClick={() => closeExample('preview')}>
                Edit Document
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => closeExample('preview')}>
                Close Preview
              </ActionButton>
            </div>
          </div>
        </BaseModal>

        {/* Help Modal */}
        <BaseModal
          isOpen={openExamples.help}
          onClose={() => closeExample('help')}
          title="Help & Support"
          size="sm"
          showCloseButton
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Frequently Asked Questions</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-900">How do I reset my password?</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Click on &quot;Forgot Password&quot; on the login page and follow the instructions sent to your email.
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">How do I change my subscription?</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to Settings → Billing to view and modify your current subscription plan.
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Can I export my data?</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Yes, you can export all your data from Settings → Data Export.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Need more help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <ActionButton variant="secondary" onClick={() => closeExample('help')}>
                Contact Support
              </ActionButton>
            </div>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// Individual variant stories for detailed docs
export const WithCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Modal with Close Button
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal with Close Button"
          size="sm"
          showCloseButton={true}
        >
          <div className="space-y-4">
            <p>This modal includes a close button in the header for easy dismissal.</p>
            <ActionButton onClick={() => setIsOpen(false)}>
              Done
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Modal without Close Button
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal without Close Button"
          size="sm"
          showCloseButton={false}
        >
          <div className="space-y-4">
            <p>This modal doesn&apos;t have a close button. Use Escape key to close.</p>
            <ActionButton onClick={() => setIsOpen(false)}>
              Close Modal
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// Individual size stories
export const Small: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Small Modal
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Small Modal"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is a small modal.</p>
            <ActionButton onClick={() => setIsOpen(false)}>
              OK
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const Medium: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Medium Modal
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Medium Modal"
          size="md"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is a medium modal (default size).</p>
            <ActionButton onClick={() => setIsOpen(false)}>
              Continue
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const Large: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Large Modal
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Large Modal"
          size="lg"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is a large modal with more space for content.</p>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Example Content</h4>
              <p className="text-sm text-gray-600">Additional content area.</p>
            </div>
            <ActionButton onClick={() => setIsOpen(false)}>
              Save
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const ExtraLarge: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Extra Large Modal
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Extra Large Modal"
          size="xl"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This is an extra large modal for complex content.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium">Left Panel</h4>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium">Right Panel</h4>
              </div>
            </div>
            <ActionButton onClick={() => setIsOpen(false)}>
              Apply
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

// Modal states
export const ModalOpen: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="p-4">
        <ActionButton onClick={() => setIsOpen(true)}>
          Open Modal
        </ActionButton>
        
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Open Modal"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This modal is in the open state.</p>
            <ActionButton onClick={() => setIsOpen(false)}>
              Close
            </ActionButton>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const ModalClosed: Story = {
  render: () => {
    return (
      <div className="p-4">
        <p className="text-gray-600 mb-4">This story shows a closed modal (nothing visible).</p>
        <BaseModal
          isOpen={false}
          onClose={() => {}}
          title="Closed Modal"
          size="sm"
          showCloseButton
        >
          <div className="space-y-4">
            <p>This modal is closed and won&apos;t be visible.</p>
          </div>
        </BaseModal>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};