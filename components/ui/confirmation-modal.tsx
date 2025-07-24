'use client'

import { BaseModal } from './base-modal'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  warningMessage?: string
  confirmText: string
  confirmColor?: 'red' | 'blue' | 'green'
  isLoading?: boolean
  items?: Array<{
    title: string
    children?: number
    description?: string
  }>
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningMessage,
  confirmText,
  confirmColor = 'red',
  isLoading = false,
  items = []
}: ConfirmationModalProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const confirmColorClasses = {
    red: 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400',
    blue: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400',
    green: 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>

        {warningMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{warningMessage}</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-gray-50 rounded-md p-3">
            <h4 className="font-medium text-gray-900 mb-2">Items to be affected:</h4>
            <div className="space-y-1">
              {items.map((item, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{item.title}</span>
                  {item.children !== undefined && (
                    <span className="text-gray-500"> ({item.children} children)</span>
                  )}
                  {item.description && (
                    <span className="text-gray-500 block ml-2">{item.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 ${confirmColorClasses[confirmColor]} text-white px-4 py-2 rounded-md font-medium transition-colors`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </BaseModal>
  )
}