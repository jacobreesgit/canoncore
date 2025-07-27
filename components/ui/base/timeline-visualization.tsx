'use client'

import { ReactNode } from 'react'
import { Badge } from './badge'

// Generic timeline visualization components

export interface TimelineItem {
  id: string
  position: number
  isHighlighted?: boolean
}

interface TimelineContainerProps {
  title: string
  itemCount: number
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'info'
}

export function TimelineContainer({ 
  title, 
  itemCount, 
  children, 
  variant = 'primary' 
}: TimelineContainerProps) {
  const getVariantStyles = (variant: string) => {
    const styles = {
      primary: 'border-blue-300 bg-blue-50',
      secondary: 'border-gray-300 bg-gray-50',
      info: 'border-purple-300 bg-purple-50'
    }
    return styles[variant as keyof typeof styles] || styles.primary
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getVariantStyles(variant)}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <Badge variant="secondary">
          {itemCount} items
        </Badge>
      </div>
      {children}
    </div>
  )
}

interface TimelineTrackProps {
  children: ReactNode
}

export function TimelineTrack({ children }: TimelineTrackProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute top-6 left-4 right-4 h-0.5 bg-gray-300"></div>
      
      {/* Timeline items */}
      <div className="flex justify-between items-start space-x-4 relative">
        {children}
      </div>
    </div>
  )
}

interface TimelineMarkerProps {
  position: number
  isHighlighted?: boolean
  children?: ReactNode
}

export function TimelineMarker({ 
  position, 
  isHighlighted = false, 
  children 
}: TimelineMarkerProps) {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      {/* Timeline marker */}
      <div 
        className={`w-3 h-3 rounded-full border-2 relative z-10 ${
          isHighlighted 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-white border-gray-400'
        }`}
      />
      
      {/* Position number */}
      <div className="text-xs text-gray-500 mt-1">
        {position + 1}
      </div>
      
      {/* Content */}
      {children}
    </div>
  )
}

interface TimelineItemCardProps {
  title: string
  subtitle?: string
  isHighlighted?: boolean
  href?: string
  onClick?: () => void
  children?: ReactNode
}

export function TimelineItemCard({ 
  title, 
  subtitle, 
  isHighlighted = false,
  href,
  onClick,
  children 
}: TimelineItemCardProps) {
  const cardClass = `mt-2 p-3 rounded-lg border-2 transition-all hover:shadow-md block w-full min-w-0 ${
    isHighlighted
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 bg-white hover:border-gray-300'
  }`

  const content = (
    <div className="text-center">
      <p className="font-medium text-sm text-gray-900 truncate" title={title}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-600 mt-1">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )

  if (href) {
    return (
      <a href={href} className={cardClass}>
        {content}
      </a>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cardClass}>
        {content}
      </button>
    )
  }

  return (
    <div className={cardClass.replace('hover:shadow-md', '')}>
      {content}
    </div>
  )
}