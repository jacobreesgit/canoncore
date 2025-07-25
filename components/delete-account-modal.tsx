'use client'

import { useState } from 'react'
import { useDeleteAccount } from '@/hooks/use-account-deletion'
import { BaseModal } from './ui/base-modal'
import { ActionButton } from './ui/action-button'
import { VStack, HStack } from './ui'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const deleteAccountMutation = useDeleteAccount()

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await deleteAccountMutation.mutateAsync({ confirmationText })
      // Success handled by the hook (redirects to home)
    } catch (error) {
      // Error display is handled by the mutation
    }
  }

  const isValidConfirmation = confirmationText === 'DELETE'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      showCloseButton={true}
      size="lg"
    >
      <form onSubmit={handleDelete}>
        <VStack spacing="lg">
          <VStack spacing="md">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <HStack spacing="sm" align="start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <VStack spacing="sm">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning: This action is irreversible
                  </h3>
                  <div className="text-sm text-red-700">
                    <VStack spacing="xs" as="ul" className="list-disc list-inside">
                      <li>All your universes and content will be permanently deleted</li>
                      <li>Your account data will be removed from CanonCore</li>
                      <li>You will be signed out and cannot access your data</li>
                      <li>This cannot be undone</li>
                    </VStack>
                    <p className="mt-2 text-xs">
                      Note: Your authentication account will remain. Contact support if you need it fully removed.
                    </p>
                  </div>
                </VStack>
              </HStack>
            </div>

            <VStack spacing="xs">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </VStack>

            <VStack spacing="xs">
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
                Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm
              </label>
              <input
                type="text"
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </VStack>

            {deleteAccountMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  {(deleteAccountMutation.error as Error).message}
                </p>
              </div>
            )}
          </VStack>

          <HStack justify="end" spacing="sm" className="pt-4">
            <ActionButton
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={deleteAccountMutation.isPending}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              variant="danger"
              disabled={!isValidConfirmation || deleteAccountMutation.isPending}
              isLoading={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? 'Deleting Account...' : 'Delete Account Forever'}
            </ActionButton>
          </HStack>
        </VStack>
      </form>
    </BaseModal>
  )
}