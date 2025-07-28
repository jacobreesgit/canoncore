'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ToastContainer } from '@/components/ui/feedback/toast-container'
import type { ToastProps, ToastVariant, ToastAction } from '@/components/ui/feedback/toast'

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string
  dismissToast: (id: string) => void
  dismissAllToasts: () => void
  // Convenience methods
  success: (title: string, message?: string, options?: ToastOptions) => string
  error: (title: string, message?: string, options?: ToastOptions) => string
  warning: (title: string, message?: string, options?: ToastOptions) => string
  info: (title: string, message?: string, options?: ToastOptions) => string
}

interface ToastOptions {
  duration?: number
  persistent?: boolean
  action?: ToastAction
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const showToast = (toast: Omit<ToastProps, 'id' | 'onDismiss'>): string => {
    const id = generateId()
    const newToast: ToastProps = {
      ...toast,
      id,
      onDismiss: dismissToast
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const dismissAllToasts = () => {
    setToasts([])
  }

  // Convenience methods
  const success = (title: string, message?: string, options?: ToastOptions): string => {
    return showToast({
      title,
      message,
      variant: 'success',
      ...options
    })
  }

  const error = (title: string, message?: string, options?: ToastOptions): string => {
    return showToast({
      title,
      message,
      variant: 'error',
      persistent: options?.persistent ?? true, // Errors persistent by default
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: ToastOptions): string => {
    return showToast({
      title,
      message,
      variant: 'warning',
      ...options
    })
  }

  const info = (title: string, message?: string, options?: ToastOptions): string => {
    return showToast({
      title,
      message,
      variant: 'info',
      ...options
    })
  }

  const contextValue: ToastContextType = {
    showToast,
    dismissToast,
    dismissAllToasts,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}