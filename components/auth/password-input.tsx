'use client'

import { forwardRef } from 'react'
import { Input, InputProps } from '@/components/ui'

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="password"
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'