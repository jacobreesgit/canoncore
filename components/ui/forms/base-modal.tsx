'use client'

import { ReactNode, useEffect } from 'react'
import { IconButton } from '../base/icon-button'
import { HeaderTitle } from '../layout/header'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl'
}

export function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  showCloseButton = false, 
  size = 'md', 
  children 
}: BaseModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        {showCloseButton ? (
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <HeaderTitle level={2}>{title}</HeaderTitle>
            <IconButton
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </IconButton>
          </div>
        ) : (
          <HeaderTitle level={2} className="mb-4 flex-shrink-0">{title}</HeaderTitle>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}