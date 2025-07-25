'use client'

import { ReactNode, useState } from 'react'
import { Stack } from './stack'
import { IconButton, ChevronLeftIcon, ChevronRightIcon } from './icon-button'

type SidebarWidth = 'sm' | 'md' | 'lg' | 'xl' | 'auto'
type SidebarPosition = 'left' | 'right'

interface SidebarProps {
  children: ReactNode
  width?: SidebarWidth
  position?: SidebarPosition
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
}

interface SidebarLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  sidebarWidth?: SidebarWidth
  sidebarPosition?: SidebarPosition
  sidebarCollapsible?: boolean
  sidebarDefaultCollapsed?: boolean
  gap?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const widthStyles: Record<SidebarWidth, string> = {
  sm: 'w-48',
  md: 'w-64',
  lg: 'w-80',
  xl: 'w-96',
  auto: 'w-auto'
}

const collapsedWidthStyles: Record<SidebarWidth, string> = {
  sm: 'w-12',
  md: 'w-12', 
  lg: 'w-12',
  xl: 'w-12',
  auto: 'w-12'
}

const gapStyles = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
}

export function Sidebar({
  children,
  width = 'md',
  position = 'left',
  collapsible = false,
  defaultCollapsed = false,
  className = ''
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  
  const widthClass = isCollapsed ? collapsedWidthStyles[width] : widthStyles[width]
  const baseStyles = 'flex-shrink-0 bg-white border-gray-200'
  const borderClass = position === 'left' ? 'border-r' : 'border-l'
  
  const combinedClassName = `${baseStyles} ${widthClass} ${borderClass} ${className}`.trim()

  return (
    <aside className={combinedClassName}>
      <div className="h-full relative">
        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-4 ${position === 'left' ? '-right-3' : '-left-3'} z-10 p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {position === 'left' ? (
              isCollapsed ? <ChevronRightIcon className="w-3 h-3" /> : <ChevronLeftIcon className="w-3 h-3" />
            ) : (
              isCollapsed ? <ChevronLeftIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />
            )}
          </button>
        )}
        
        <div className={`h-full overflow-y-auto transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          {!isCollapsed && children}
        </div>
      </div>
    </aside>
  )
}

export function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  sidebarCollapsible = false,
  sidebarDefaultCollapsed = false,
  gap = 'md',
  className = ''
}: SidebarLayoutProps) {
  const baseStyles = 'min-h-screen flex'
  const gapClass = gapStyles[gap]
  
  const combinedClassName = `${baseStyles} ${gapClass} ${className}`.trim()
  
  const sidebarElement = (
    <Sidebar
      width={sidebarWidth}
      position={sidebarPosition}
      collapsible={sidebarCollapsible}
      defaultCollapsed={sidebarDefaultCollapsed}
    >
      {sidebar}
    </Sidebar>
  )
  
  const mainContent = (
    <main className="flex-1 min-w-0">
      {children}
    </main>
  )

  return (
    <div className={combinedClassName}>
      {sidebarPosition === 'left' ? (
        <>
          {sidebarElement}
          {mainContent}
        </>
      ) : (
        <>
          {mainContent}
          {sidebarElement}
        </>
      )}
    </div>
  )
}

// Convenience components for common sidebar content patterns
export function SidebarHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export function SidebarContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex-1 p-4 ${className}`}>
      {children}
    </div>
  )
}

export function SidebarFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-4 border-t border-gray-200 mt-auto ${className}`}>
      {children}
    </div>
  )
}