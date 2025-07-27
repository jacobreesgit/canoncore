'use client'

import { Badge } from './badge'

interface CountBadgeProps {
  count: number
  icon?: string
  label?: string
  size?: 'sm' | 'md'
  variant?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger'
  showZero?: boolean
}

export function CountBadge({ 
  count, 
  icon = '•',
  label = 'items',
  size = 'sm',
  variant = 'info',
  showZero = false
}: CountBadgeProps) {
  if (!showZero && count === 0) {
    return null
  }

  const singularLabel = label.endsWith('s') ? label.slice(0, -1) : label
  const displayLabel = count === 1 ? singularLabel : label

  return (
    <div title={`${count} ${displayLabel}`}>
      <Badge 
        variant={variant}
        size={size}
      >
        {icon} {count}
      </Badge>
    </div>
  )
}