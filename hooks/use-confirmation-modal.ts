'use client'

import { useState } from 'react'

export interface ConfirmationModalConfig {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'primary' | 'warning'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmationModalConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const openModal = (modalConfig: ConfirmationModalConfig) => {
    setConfig(modalConfig)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setIsLoading(false)
    if (config?.onCancel) {
      config.onCancel()
    }
  }

  const handleConfirm = async () => {
    if (!config) return

    try {
      setIsLoading(true)
      await config.onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
      // Keep modal open on error so user can retry or cancel
    } finally {
      setIsLoading(false)
    }
  }

  const modalProps = config ? {
    isOpen,
    onClose: closeModal,
    title: config.title || 'Confirm Action',
    message: config.message,
    confirmText: config.confirmText || 'Confirm',
    cancelText: config.cancelText || 'Cancel',
    confirmVariant: config.confirmVariant || 'primary',
    isLoading,
    onConfirm: handleConfirm,
  } : null

  return {
    openModal,
    closeModal,
    modalProps,
    isOpen,
    isLoading,
  }
}