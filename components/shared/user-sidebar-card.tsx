import { ReactNode } from 'react'
import { Card, VStack, HStack, SectionHeader, ActionButton } from '@/components/ui'
import { UserProfile } from './user-profile'

interface UserSidebarCardProps {
  user: any
  onSignOut: () => void
  onDeleteAccount?: () => void
  showDeleteAccount?: boolean
  pageActions?: ReactNode
}

export function UserSidebarCard({ 
  user, 
  onSignOut, 
  onDeleteAccount,
  showDeleteAccount = false,
  pageActions 
}: UserSidebarCardProps) {
  return (
    <Card>
      <VStack spacing="md">
        <SectionHeader title="User" level={3} />
        
        <VStack spacing="sm">
          <UserProfile
            user={user}
            onSignOut={onSignOut}
            onDeleteAccount={onDeleteAccount}
            showDeleteAccount={showDeleteAccount}
            variant="card"
            size="md"
          />
        </VStack>

        {pageActions && (
          <VStack spacing="sm" className="pt-4 border-t border-gray-200">
            {pageActions}
          </VStack>
        )}
      </VStack>
    </Card>
  )
}