'use client'

import { BaseVersion } from '@/hooks/use-version-management'
import { ActionButton } from '@/components/ui'
import { StatusBadge, VStack, HStack, SectionHeader, EmptyState, ConfirmationModal, Card, LoadingWrapper, HeaderTitle } from '@/components/ui'

export type VersionListLayout = 'card' | 'tab' | 'list'

interface VersionListViewProps<T extends BaseVersion> {
  // Data
  versions: T[]
  isLoading: boolean
  
  // Display configuration
  layout: VersionListLayout
  title: string
  emptyStateTitle: string
  emptyStateDescription: string
  
  // Actions
  onCreateVersion: () => void
  onEditVersion: (version: T) => void
  onDeleteVersion: (version: T) => void
  onSetPrimary: (version: T) => void
  
  // State
  isDeleting: boolean
  isSettingPrimary: boolean
  
  // Field mappings for different version types
  fieldMappings: {
    isPrimary: keyof T
    description: keyof T
  }
  
  // Modal props (for confirmation modal)
  confirmationModalProps?: any
  
  // Optional customizations
  showCreateButton?: boolean
  createButtonSize?: 'xs' | 'sm' | 'md' | 'lg'
  wrapInCard?: boolean
  className?: string
}

export function VersionListView<T extends BaseVersion>({
  versions,
  isLoading,
  layout,
  title,
  emptyStateTitle,
  emptyStateDescription,
  onCreateVersion,
  onEditVersion,
  onDeleteVersion,
  onSetPrimary,
  isDeleting,
  isSettingPrimary,
  fieldMappings,
  confirmationModalProps,
  showCreateButton = true,
  createButtonSize = 'sm',
  wrapInCard = true,
  className = '',
}: VersionListViewProps<T>) {
  
  const renderVersionItem = (version: T) => {
    const isPrimary = version[fieldMappings.isPrimary] as boolean
    const description = version[fieldMappings.description] as string | undefined
    
    const itemClassName = layout === 'tab' 
      ? `border rounded-lg p-4 ${isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`
      : `p-3 rounded border text-sm ${isPrimary ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`

    return (
      <div key={version.id} className={itemClassName}>
        <VStack spacing="sm">
          <HStack justify="between" align={layout === 'tab' ? 'start' : 'center'}>
            <HStack spacing="sm" align="center">
              {layout === 'tab' ? (
                <HeaderTitle level={4} className="font-medium text-gray-900">
                  {version.version_name}
                </HeaderTitle>
              ) : (
                <span className="font-medium text-gray-900">
                  {version.version_name}
                </span>
              )}
              {isPrimary && (
                <StatusBadge status="Primary" variant="primary" />
              )}
            </HStack>
            
            {layout === 'tab' ? (
              <HStack spacing="sm">
                {!isPrimary && (
                  <ActionButton
                    onClick={() => onSetPrimary(version)}
                    disabled={isSettingPrimary}
                    variant="primary"
                    size="xs"
                  >
                    Set Primary
                  </ActionButton>
                )}
                <ActionButton
                  onClick={() => onEditVersion(version)}
                  variant="secondary"
                  size="xs"
                >
                  Edit
                </ActionButton>
                <ActionButton
                  onClick={() => onDeleteVersion(version)}
                  disabled={isDeleting || versions.length === 1}
                  variant="danger"
                  size="xs"
                  title={versions.length === 1 ? "Cannot delete the last version" : "Delete version"}
                >
                  Delete
                </ActionButton>
              </HStack>
            ) : (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(version.created_at).toLocaleDateString()}
              </span>
            )}
          </HStack>
          
          {description && (
            layout === 'tab' ? (
              <div className="text-sm text-gray-700">
                <span className="font-medium">
                  {fieldMappings.description === 'notes' ? 'Notes:' : 'Message:'}
                </span> {description}
              </div>
            ) : (
              <p className="text-xs text-gray-600 break-words">
                {description}
              </p>
            )
          )}
          
          {layout === 'tab' && (
            <div className="text-xs text-gray-500">
              Created {new Date(version.created_at).toLocaleDateString()}
            </div>
          )}
          
          {layout !== 'tab' && (
            <HStack spacing="sm">
              {!isPrimary && (
                <ActionButton
                  onClick={() => onSetPrimary(version)}
                  disabled={isSettingPrimary}
                  variant="primary"
                  size="xs"
                >
                  Set Primary
                </ActionButton>
              )}
              <ActionButton
                onClick={() => onEditVersion(version)}
                variant="secondary"
                size="xs"
              >
                Edit
              </ActionButton>
              <ActionButton
                onClick={() => onDeleteVersion(version)}
                disabled={isDeleting || versions.length === 1}
                variant="danger"
                size="xs"
                title={versions.length === 1 ? "Cannot delete the last version" : "Delete version"}
              >
                Delete
              </ActionButton>
            </HStack>
          )}
        </VStack>
      </div>
    )
  }

  const renderContent = () => (
    <VStack spacing={layout === 'tab' ? 'md' : 'sm'}>
      <SectionHeader
        title={title}
        level={3}
        actions={
          showCreateButton ? (
            <ActionButton
              onClick={onCreateVersion}
              variant="primary"
              size={createButtonSize}
            >
              Add Version
            </ActionButton>
          ) : undefined
        }
      />

      {versions.length === 0 ? (
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          size={layout === 'tab' ? 'lg' : 'md'}
        />
      ) : (
        <VStack spacing="sm">
          {versions.map(renderVersionItem)}
        </VStack>
      )}
      
      {confirmationModalProps && (
        <ConfirmationModal {...confirmationModalProps} />
      )}
    </VStack>
  )

  const content = (
    <LoadingWrapper 
      isLoading={isLoading}
      fallback="card"
      showTitle={true}
      lines={3}
      wrapInCard={wrapInCard && layout !== 'tab'}
      className={layout === 'tab' ? 'p-4' : undefined}
    >
      {wrapInCard && layout !== 'tab' ? (
        <Card className={className}>
          {renderContent()}
        </Card>
      ) : (
        <div className={className}>
          {renderContent()}
        </div>
      )}
    </LoadingWrapper>
  )

  return content
}