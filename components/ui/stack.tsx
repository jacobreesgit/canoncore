'use client'

import { ReactNode, ElementType } from 'react'

type StackDirection = 'vertical' | 'horizontal'
type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type StackAlign = 'start' | 'center' | 'end' | 'stretch'
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

interface StackProps {
  children: ReactNode
  direction?: StackDirection
  spacing?: StackSpacing
  align?: StackAlign
  justify?: StackJustify
  wrap?: boolean
  className?: string
  as?: ElementType
}

const spacingStyles: Record<StackDirection, Record<StackSpacing, string>> = {
  vertical: {
    none: 'space-y-0',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12'
  },
  horizontal: {
    none: 'space-x-0',
    xs: 'space-x-1',
    sm: 'space-x-2', 
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
    '2xl': 'space-x-12'
  }
}

const alignStyles: Record<StackDirection, Record<StackAlign, string>> = {
  vertical: {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  },
  horizontal: {
    start: 'items-start',
    center: 'items-center', 
    end: 'items-end',
    stretch: 'items-stretch'
  }
}

const justifyStyles: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
}

export function Stack({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
  as: Component = 'div'
}: StackProps) {
  const baseStyles = 'flex'
  const directionStyles = direction === 'horizontal' ? 'flex-row' : 'flex-col'
  const spacingClasses = spacingStyles[direction][spacing]
  const alignClasses = alignStyles[direction][align]
  const justifyClasses = justifyStyles[justify]
  const wrapClasses = wrap ? 'flex-wrap' : ''
  
  const combinedClassName = `${baseStyles} ${directionStyles} ${spacingClasses} ${alignClasses} ${justifyClasses} ${wrapClasses} ${className}`.trim()

  return (
    <Component className={combinedClassName}>
      {children}
    </Component>
  )
}

// Convenience components for common patterns
export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="vertical" />
}

export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="horizontal" />
}