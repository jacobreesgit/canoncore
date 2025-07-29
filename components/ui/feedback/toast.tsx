'use client'

import { useCallback, useEffect, useState } from 'react'
import { ActionButton } from '../base/action-button'
import { IconButton, CloseIcon } from '../base/icon-button'
import { HStack, VStack } from '../layout/stack'
import { HeaderTitle } from '../layout/header'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  text: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export interface ToastProps {
  id: string
  title: string
  message?: string
  variant: ToastVariant
  duration?: number
  persistent?: boolean
  action?: ToastAction
  onDismiss: (id: string) => void
}

const variantStyles: Record<ToastVariant, {
  container: string
  icon: string
  iconBg: string
}> = {
  success: {
    container: 'border-green-200 bg-green-50',
    icon: '✓',
    iconBg: 'bg-green-100 text-green-600'
  },
  error: {
    container: 'border-red-200 bg-red-50',
    icon: '✕',
    iconBg: 'bg-red-100 text-red-600'
  },
  warning: {
    container: 'border-amber-200 bg-amber-50',
    icon: '⚠',
    iconBg: 'bg-amber-100 text-amber-600'
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    icon: 'ℹ',
    iconBg: 'bg-blue-100 text-blue-600'
  }
}

export function Toast({
  id,
  title,
  message,
  variant,
  duration = 5000,
  persistent = false,
  action,
  onDismiss
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  const styles = variantStyles[variant]

  // Slide in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(id)
    }, 200) // Match exit animation duration
  }, [id, onDismiss])

  // Auto dismiss
  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(handleDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, persistent, handleDismiss])

  return (
    <div
      className={`
        min-w-80 max-w-md p-4 rounded-lg border shadow-lg
        transform transition-all duration-200 ease-out
        ${styles.container}
        ${isVisible && !isExiting 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-2 opacity-0'
        }
      `}
    >
      <HStack spacing="sm" align="start">
        {/* Icon */}
        <div className={`
          w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
          ${styles.iconBg}
        `}>
          {styles.icon}
        </div>

        {/* Content */}
        <VStack spacing="xs" className="flex-1 min-w-0">
          <HStack justify="between" align="start" className="w-full">
            <HeaderTitle level={4} className="text-sm font-medium text-gray-900 break-words">
              {title}
            </HeaderTitle>
            
            {/* Close button */}
            <IconButton
              onClick={handleDismiss}
              variant="default"
              size="sm"
              aria-label="Dismiss notification"
              className="flex-shrink-0 ml-2"
            >
              <CloseIcon className="w-4 h-4" />
            </IconButton>
          </HStack>

          {/* Message */}
          {message && (
            <p className="text-sm text-gray-600 break-words">
              {message}
            </p>
          )}

          {/* Action button */}
          {action && (
            <div className="mt-2">
              <ActionButton
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                size="xs"
              >
                {action.text}
              </ActionButton>
            </div>
          )}
        </VStack>
      </HStack>
    </div>
  )
}