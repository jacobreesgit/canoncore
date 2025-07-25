'use client'

import { useState } from 'react'
import { useUniverseVersions, useSwitchUniverseVersion, useDeleteUniverseVersion, useUpdateUniverseVersion } from '@/hooks/use-universe-versions'
import { CreateVersionModal } from './create-version-modal'
import { EditUniverseVersionModal } from './edit-universe-version-modal'
import { ActionButton } from './ui/action-button'
import { UniverseVersion } from '@/types/database'
import { Card, LoadingCard, StatusBadge, VStack, HStack, SectionHeader } from './ui'

interface UniverseVersionsCardProps {
  universeId: string
}

export function UniverseVersionsCard({ universeId }: UniverseVersionsCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingVersion, setEditingVersion] = useState<UniverseVersion | null>(null)
  
  const { data: versions = [], isLoading } = useUniverseVersions(universeId)
  const switchVersionMutation = useSwitchUniverseVersion()
  const deleteVersionMutation = useDeleteUniverseVersion()

  const handleDeleteVersion = async (version: UniverseVersion) => {
    if (versions.length === 1) {
      alert('Cannot delete the last remaining version. Each universe must have at least one version.')
      return
    }

    if (!confirm(`Are you sure you want to delete the "${version.version_name}" version?`)) {
      return
    }

    try {
      await deleteVersionMutation.mutateAsync({
        versionId: version.id,
        universeId: universeId
      })
    } catch (error) {
      console.error('Failed to delete version:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete version'
      alert(errorMessage)
    }
  }

  const handleSetPrimary = async (version: UniverseVersion) => {
    if (version.is_current) return

    try {
      await switchVersionMutation.mutateAsync({
        universeId: universeId,
        versionId: version.id
      })
    } catch (error) {
      console.error('Failed to set primary version:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <LoadingCard showTitle={true} lines={3} />
      </Card>
    )
  }

  return (
    <Card>
      <VStack spacing="md">
        <SectionHeader
          title={`Versions (${versions.length})`}
          level={2}
          actions={
            <ActionButton
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
            >
              Add Version
            </ActionButton>
          }
        />

        {versions.length === 0 ? (
          <VStack spacing="sm" align="center" className="py-6 text-gray-500">
            <p>No versions created yet</p>
            <p className="text-xs">Create versions to save universe snapshots</p>
          </VStack>
        ) : (
          <VStack spacing="sm">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-3 rounded border text-sm ${
                  version.is_current ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <VStack spacing="sm">
                  <HStack justify="between" align="center">
                    <HStack spacing="sm" align="center">
                      <span className="font-medium text-gray-900">
                        {version.version_name}
                      </span>
                      {version.is_current && (
                        <StatusBadge status="Primary" variant="primary" />
                      )}
                    </HStack>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(version.created_at).toLocaleDateString()}
                    </span>
                  </HStack>
                  
                  {version.commit_message && (
                    <p className="text-xs text-gray-600 break-words">
                      {version.commit_message}
                    </p>
                  )}
                  
                  <HStack spacing="sm">
                    {!version.is_current && (
                      <ActionButton
                        onClick={() => handleSetPrimary(version)}
                        disabled={switchVersionMutation.isPending}
                        variant="primary"
                        size="xs"
                      >
                        Set Primary
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={() => setEditingVersion(version)}
                      variant="secondary"
                      size="xs"
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDeleteVersion(version)}
                      disabled={deleteVersionMutation.isPending || versions.length === 1}
                      variant="danger"
                      size="xs"
                      title={versions.length === 1 ? "Cannot delete the last version" : "Delete version"}
                    >
                      Delete
                    </ActionButton>
                  </HStack>
                </VStack>
              </div>
            ))}
          </VStack>
        )}
      </VStack>

      <CreateVersionModal
        universeId={universeId}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <EditUniverseVersionModal
        version={editingVersion}
        isOpen={!!editingVersion}
        onClose={() => setEditingVersion(null)}
      />
    </Card>
  )
}