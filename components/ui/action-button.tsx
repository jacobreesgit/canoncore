import { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingButtonContent } from './loading'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  info: 'bg-gray-600 hover:bg-gray-700 text-white'
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

export function ActionButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ActionButtonProps) {
  const baseStyles = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  const disabledStyles = 'disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50'
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingButtonContent>{children}</LoadingButtonContent>
      ) : (
        children
      )}
    </button>
  )
}