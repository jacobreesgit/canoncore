'use client'

import { useUniverseVersions, useSwitchUniverseVersion, useDeleteUniverseVersion } from '@/hooks/use-universe-versions'
import { useVersionManagement, VersionManagementConfig } from '@/hooks/use-version-management'
import { CreateVersionModal } from '@/components/modals'
import { EditUniverseVersionModal } from './edit-universe-version-modal'
import { UniverseVersion } from '@/types/database'
import { VersionListView } from '@/components/shared/version-list-view'

interface UniverseVersionsCardProps {
  universeId: string
}

export function UniverseVersionsCard({ universeId }: UniverseVersionsCardProps) {
  // Wrapper components to adapt to generic interface
  const CreateModalWrapper = ({ entityId, isOpen, onClose }: { entityId: string; isOpen: boolean; onClose: () => void }) => (
    <CreateVersionModal universeId={entityId} isOpen={isOpen} onClose={onClose} />
  )
  
  const EditModalWrapper = ({ version, isOpen, onClose }: { version: UniverseVersion | null; isOpen: boolean; onClose: () => void }) => (
    <EditUniverseVersionModal version={version} isOpen={isOpen} onClose={onClose} />
  )

  const config: VersionManagementConfig<UniverseVersion> = {
    useVersionsQuery: useUniverseVersions,
    useDeleteVersion: useDeleteUniverseVersion,
    useSetPrimaryVersion: useSwitchUniverseVersion,
    minimumVersions: 1,
    fieldMappings: {
      isPrimary: 'is_current',
      description: 'commit_message',
    },
    confirmationOptions: {
      deleteTitle: 'Delete Version',
      deleteWarning: (versionName: string) => 
        `Are you sure you want to delete the "${versionName}" version?`,
      lastVersionMessage: 'Each universe must have at least one version.',
    },
    modals: {
      CreateModal: CreateModalWrapper,
      EditModal: EditModalWrapper,
    },
    useToastNotifications: true, // Uses toast notifications
  }

  const versionManagement = useVersionManagement(universeId, config)

  return (
    <>
      <VersionListView
        versions={versionManagement.versions}
        isLoading={versionManagement.isLoading}
        layout="card"
        title={`Versions (${versionManagement.versions.length})`}
        emptyStateTitle="No versions created yet"
        emptyStateDescription="Create versions to save universe snapshots"
        onCreateVersion={versionManagement.openCreateModal}
        onEditVersion={versionManagement.openEditModal}
        onDeleteVersion={versionManagement.handleDeleteVersion}
        onSetPrimary={versionManagement.handleSetPrimary}
        isDeleting={versionManagement.isDeleting}
        isSettingPrimary={versionManagement.isSettingPrimary}
        fieldMappings={versionManagement.fieldMappings}
        createButtonSize="sm"
        wrapInCard={true}
      />
      
      <versionManagement.CreateModal
        entityId={universeId}
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