'use client'

import { useContentVersions, useDeleteContentVersion, useSetPrimaryVersion, ContentVersion } from '@/hooks/use-content-versions'
import { useVersionManagement, VersionManagementConfig } from '@/hooks/use-version-management'
import { CreateContentVersionModal } from './create-content-version-modal'
import { EditContentVersionModal } from './edit-content-version-modal'
import { VersionListView } from '@/components/shared/version-list-view'

interface ContentVersionsTabProps {
  contentItemId: string
}

export function ContentVersionsTab({ contentItemId }: ContentVersionsTabProps) {
  // Wrapper components to adapt to generic interface
  const CreateModalWrapper = ({ entityId, isOpen, onClose }: { entityId: string; isOpen: boolean; onClose: () => void }) => (
    <CreateContentVersionModal contentItemId={entityId} isOpen={isOpen} onClose={onClose} />
  )
  
  const EditModalWrapper = ({ version, isOpen, onClose }: { version: ContentVersion | null; isOpen: boolean; onClose: () => void }) => (
    <EditContentVersionModal version={version} isOpen={isOpen} onClose={onClose} />
  )

  const config: VersionManagementConfig<ContentVersion> = {
    useVersionsQuery: useContentVersions,
    useDeleteVersion: useDeleteContentVersion,
    useSetPrimaryVersion: useSetPrimaryVersion,
    minimumVersions: 1,
    fieldMappings: {
      isPrimary: 'is_primary',
      description: 'notes',
    },
    confirmationOptions: {
      deleteTitle: 'Delete Version',
      deleteWarning: (versionName: string) => 
        `Are you sure you want to delete the "${versionName}" version?`,
      lastVersionMessage: 'Each content item must have at least one version.',
    },
    modals: {
      CreateModal: CreateModalWrapper,
      EditModal: EditModalWrapper,
    },
    useToastNotifications: true, // Uses toast notifications instead of confirmation modal
  }

  const versionManagement = useVersionManagement(contentItemId, config)

  return (
    <>
      <VersionListView
        versions={versionManagement.versions}
        isLoading={versionManagement.isLoading}
        layout="tab"
        title={`Versions (${versionManagement.versions.length})`}
        emptyStateTitle="No versions created yet"
        emptyStateDescription={`Add versions like "Director's Cut", "Extended Edition", etc.`}
        onCreateVersion={versionManagement.openCreateModal}
        onEditVersion={versionManagement.openEditModal}
        onDeleteVersion={versionManagement.handleDeleteVersion}
        onSetPrimary={versionManagement.handleSetPrimary}
        isDeleting={versionManagement.isDeleting}
        isSettingPrimary={versionManagement.isSettingPrimary}
        fieldMappings={versionManagement.fieldMappings}
        createButtonSize="md"
        wrapInCard={false}
        className="p-4"
      />
      
      <versionManagement.CreateModal
        entityId={contentItemId}
        isOpen={versionManagement.showCreateModal}
        onClose={versionManagement.closeCreateModal}
      />
      <versionManagement.EditModal
        version={versionManagement.editingVersion}
        isOpen={!!versionManagement.editingVersion}
        onClose={versionManagement.closeEditModal}
      />
    </>
  )
}