import { ReactNode } from 'react'

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-50 text-blue-600'
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1'
}

export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'sm',
  className = '' 
}: BadgeProps) {
  return (
    <span 
      className={`inline-flex items-center font-medium rounded ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}

// Specialized badge for version counts
export function VersionBadge({ count }: { count: number }) {
  if (count <= 1) return null
  
  return (
    <Badge variant="info" size="sm">
      {count} versions
    </Badge>
  )
}

// Specialized badge for status indicators
export function StatusBadge({ 
  status, 
  variant = 'primary' 
}: { 
  status: string
  variant?: BadgeVariant 
}) {
  return (
    <Badge variant={variant} size="sm">
      {status}
    </Badge>
  )
}

// Specialized badge for organisation types
export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="secondary" size="sm">
      {type}
    </Badge>
  )
}

// Specialized badge for public/private status
export function PublicPrivateBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <Badge variant={isPublic ? "success" : "warning"} size="sm">
      {isPublic ? "Public" : "Private"}
    </Badge>
  )
}