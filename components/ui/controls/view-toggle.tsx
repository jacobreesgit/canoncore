'use client'

import { ActionButton, HStack } from '@/components/ui'

interface ViewToggleProps {
  currentView: 'flat' | 'tree' | 'card'
  onViewChange: (view: 'flat' | 'tree' | 'card') => void
  availableViews?: ('flat' | 'tree' | 'card')[]
  size?: 'sm' | 'md'
}

const viewLabels = {
  flat: 'List',
  tree: 'Tree', 
  card: 'Cards'
} as const

const viewIcons = {
  flat: '☰',
  tree: '🌳',
  card: '⊞'
} as const

export function ViewToggle({ 
  currentView, 
  onViewChange, 
  availableViews = ['flat', 'tree', 'card'],
  size = 'sm'
}: ViewToggleProps) {
  return (
    <HStack spacing="xs">
      {availableViews.map((view) => (
        <ActionButton
          key={view}
          onClick={() => onViewChange(view)}
          variant={currentView === view ? 'primary' : 'info'}
          size={size}
          title={`Switch to ${viewLabels[view]} view`}
        >
          <HStack spacing="xs" align="center">
            <span>{viewIcons[view]}</span>
            <span>{viewLabels[view]}</span>
          </HStack>
        </ActionButton>
      ))}
    </HStack>
  )
}