'use client'

import { ReactNode } from 'react'
import { ActionButton } from '../base/action-button'
import { VStack } from './stack'

export type EmptyStateSize = 'sm' | 'md' | 'lg'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  size?: EmptyStateSize
  primaryAction?: {
    text: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'success'
  }
  secondaryAction?: {
    text: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'success'
  }
  className?: string
}

const sizeStyles: Record<EmptyStateSize, {
  container: string
  icon: string
  title: string
  description: string
}> = {
  sm: {
    container: 'py-4',
    icon: 'text-2xl',
    title: 'text-sm font-medium',
    description: 'text-xs'
  },
  md: {
    container: 'py-6',
    icon: 'text-3xl',
    title: 'text-base font-medium',
    description: 'text-sm'
  },
  lg: {
    container: 'py-8',
    icon: 'text-4xl',
    title: 'text-lg font-medium',
    description: 'text-base'
  }
}

export function EmptyState({
  icon,
  title,
  description,
  size = 'md',
  primaryAction,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  const styles = sizeStyles[size]
  
  return (
    <VStack 
      spacing={size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'} 
      align="center" 
      className={`text-center text-gray-500 ${styles.container} ${className}`}
    >
      {/* Icon */}
      {icon && (
        <div className={`${styles.icon} text-gray-400`}>
          {icon}
        </div>
      )}
      
      {/* Title */}
      <h3 className={`${styles.title} text-gray-600`}>
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className={`${styles.description} text-gray-500 max-w-md`}>
          {description}
        </p>
      )}
      
      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {primaryAction && (
            <ActionButton
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || 'primary'}
              size={size === 'lg' ? 'md' : 'sm'}
            >
              {primaryAction.text}
            </ActionButton>
          )}
          {secondaryAction && (
            <ActionButton
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'secondary'}
              size={size === 'lg' ? 'md' : 'sm'}
            >
              {secondaryAction.text}
            </ActionButton>
          )}
        </div>
      )}
    </VStack>
  )
}