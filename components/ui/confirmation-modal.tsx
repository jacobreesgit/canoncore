'use client'

import { BaseModal } from './base-modal'
import { ActionButton } from './action-button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  warningMessage?: string
  confirmText: string
  confirmColor?: 'danger' | 'primary' | 'success'
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
  confirmColor = 'danger',
  isLoading = false,
  items = []
}: ConfirmationModalProps) {
  const handleConfirm = async () => {
    await onConfirm()
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
          <ActionButton
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            variant={confirmColor}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : confirmText}
          </ActionButton>
          <ActionButton
            onClick={onClose}
            disabled={isLoading}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </ActionButton>
        </div>
      </div>
    </BaseModal>
  )
}