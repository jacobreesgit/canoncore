import { ReactNode } from 'react'
import { VStack, HStack } from './stack'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

interface LoadingSkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

interface LoadingPlaceholderProps {
  title?: string
  message?: string
  className?: string
}

interface LoadingCardProps {
  lines?: number
  showTitle?: boolean
  className?: string
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

// Animated spinner component
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <svg 
      className={`animate-spin ${sizeStyles[size]} ${className}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
        className="opacity-25" 
      />
      <path 
        fill="currentColor" 
        className="opacity-75" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  )
}

// Individual skeleton element
export function LoadingSkeleton({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = true 
}: LoadingSkeletonProps) {
  return (
    <div 
      className={`bg-gray-200 animate-pulse ${width} ${height} ${rounded ? 'rounded' : ''} ${className}`} 
    />
  )
}

// Full loading placeholder with text
export function LoadingPlaceholder({ 
  title = 'Loading...', 
  message, 
  className = '' 
}: LoadingPlaceholderProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
      <div className="text-lg font-medium text-gray-900 mb-2">{title}</div>
      {message && (
        <p className="text-gray-600">{message}</p>
      )}
    </div>
  )
}

// Card skeleton for loading states
export function LoadingCard({ 
  lines = 2, 
  showTitle = true, 
  className = '' 
}: LoadingCardProps) {
  return (
    <VStack spacing="md" className={`animate-pulse ${className}`}>
      {showTitle && (
        <LoadingSkeleton width="w-1/4" height="h-4" />
      )}
      <VStack spacing="xs">
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingSkeleton 
            key={index}
            width={index === lines - 1 ? 'w-3/4' : 'w-full'}
            height="h-3"
          />
        ))}
      </VStack>
    </VStack>
  )
}

// Loading overlay for buttons
export function LoadingButtonContent({ children }: { children: ReactNode }) {
  return (
    <HStack spacing="xs" align="center">
      <LoadingSpinner size="sm" />
      {children}
    </HStack>
  )
}