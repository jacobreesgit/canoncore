'use client'

import { Toast, ToastProps } from './toast'
import { VStack } from '../layout/stack'

export interface ToastContainerProps {
  toasts: ToastProps[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <VStack spacing="sm" className="pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onDismiss={onDismiss} />
          </div>
        ))}
      </VStack>
    </div>
  )
}