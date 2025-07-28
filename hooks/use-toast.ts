'use client'

import { useToast as useToastContext } from '@/contexts/toast-context'

// Re-export the useToast hook for convenience
export const useToast = useToastContext

// Re-export types for external usage
export type { ToastVariant, ToastAction } from '@/components/ui/feedback/toast'