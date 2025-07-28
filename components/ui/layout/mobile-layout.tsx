'use client'

import { ReactNode } from 'react'
import { VStack } from './stack'

interface MobileLayoutProps {
  // Main content
  children: ReactNode
  
  // Sidebar cards to stack below main content
  sidebarCards?: ReactNode[]
  
  // Additional spacing control
  spacing?: 'sm' | 'md' | 'lg'
}

export function MobileLayout({
  children,
  sidebarCards = [],
  spacing = 'lg'
}: MobileLayoutProps) {
  return (
    <div className="w-full">
      <VStack spacing={spacing}>
        {/* Main content */}
        <div className="w-full">
          {children}
        </div>
        
        {/* Sidebar cards stacked below */}
        {sidebarCards.length > 0 && sidebarCards.map((card, index) => (
          <div key={index} className="w-full">
            {card}
          </div>
        ))}
      </VStack>
    </div>
  )
}