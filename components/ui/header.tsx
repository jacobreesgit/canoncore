'use client'

import { ReactNode, createElement } from 'react'
import { HStack, VStack } from './stack'

type HeaderSize = 'sm' | 'md' | 'lg'
type HeaderVariant = 'default' | 'bordered' | 'elevated'

interface HeaderProps {
  children: ReactNode
  size?: HeaderSize
  variant?: HeaderVariant
  className?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  backButton?: ReactNode
  breadcrumbs?: ReactNode
  tabs?: ReactNode
  size?: HeaderSize
  variant?: HeaderVariant
  className?: string
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

const sizeStyles: Record<HeaderSize, { padding: string; title: string; subtitle: string }> = {
  sm: {
    padding: 'p-4',
    title: 'text-lg font-semibold',
    subtitle: 'text-sm text-gray-600'
  },
  md: {
    padding: 'p-6',
    title: 'text-xl font-semibold',
    subtitle: 'text-base text-gray-600'
  },
  lg: {
    padding: 'p-8',
    title: 'text-2xl font-bold',
    subtitle: 'text-lg text-gray-600'
  }
}

const variantStyles: Record<HeaderVariant, string> = {
  default: 'header bg-white',
  bordered: 'header bg-white border-b border-gray-200',
  elevated: 'header bg-white border-b border-gray-200 shadow-sm'
}

const headingStyles = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-bold', 
  3: 'text-xl font-semibold',
  4: 'text-lg font-semibold',
  5: 'text-base font-semibold',
  6: 'text-sm font-semibold'
}

export function Header({
  children,
  size = 'md',
  variant = 'default',
  className = ''
}: HeaderProps) {
  const sizeClass = sizeStyles[size].padding
  const variantClass = variantStyles[variant]
  
  const combinedClassName = `${variantClass} ${sizeClass} ${className}`.trim()

  return (
    <header className={combinedClassName}>
      {children}
    </header>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  backButton,
  breadcrumbs,
  tabs,
  size = 'lg',
  variant = 'bordered',
  className = ''
}: PageHeaderProps) {
  const styles = sizeStyles[size]
  
  return (
    <Header size={size} variant={variant} className={className}>
      <VStack spacing="md">
        {breadcrumbs && (
          <div className="text-sm text-gray-500">
            {breadcrumbs}
          </div>
        )}
        
        <HStack justify="between" align="start">
          <HStack spacing="md" align="start">
            {backButton && (
              <div className="flex-shrink-0 pt-1">
                {backButton}
              </div>
            )}
            <VStack spacing="xs">
              <h1 className={styles.title}>
                {title}
              </h1>
              {subtitle && (
                <p className={styles.subtitle}>
                  {subtitle}
                </p>
              )}
            </VStack>
          </HStack>
          
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </HStack>
        
        {tabs && (
          <div className="w-full">
            {tabs}
          </div>
        )}
      </VStack>
    </Header>
  )
}

export function SectionHeader({
  title,
  subtitle,
  actions,
  level = 2,
  className = ''
}: SectionHeaderProps) {
  const headingClass = headingStyles[level]
  
  return (
    <div className={`mb-4 ${className}`}>
      <HStack justify="between" align="start">
        <VStack spacing="xs">
          {createElement(`h${level}`, { className: headingClass }, title)}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </VStack>
        
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </HStack>
    </div>
  )
}

// Convenience components for common header patterns
export function HeaderTitle({ children, level = 1 }: { children: ReactNode; level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const headingClass = headingStyles[level]
  
  return createElement(`h${level}`, { className: headingClass }, children)
}

export function HeaderSubtitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-base text-gray-600">
      {children}
    </p>
  )
}

export function HeaderActions({ children }: { children: ReactNode }) {
  return (
    <HStack spacing="xs" align="center">
      {children}
    </HStack>
  )
}