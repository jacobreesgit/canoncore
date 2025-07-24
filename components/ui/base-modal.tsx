'use client'

import { ReactNode } from 'react'
import { IconButton } from './icon-button'

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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]}`}>
        {showCloseButton ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <IconButton
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </IconButton>
          </div>
        ) : (
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}