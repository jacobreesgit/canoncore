'use client'

import { useState } from 'react'
import { useContentVersions, useDeleteContentVersion, useSetPrimaryVersion, ContentVersion } from '@/hooks/use-content-versions'
import { CreateContentVersionModal } from './create-content-version-modal'
import { EditContentVersionModal } from './edit-content-version-modal'
import { ActionButton } from './ui/action-button'
import { StatusBadge, VStack, HStack, LoadingCard, SectionHeader } from './ui'

interface ContentVersionsTabProps {
  contentItemId: string
}

export function ContentVersionsTab({ contentItemId }: ContentVersionsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingVersion, setEditingVersion] = useState<ContentVersion | null>(null)
  
  const { data: versions = [], isLoading } = useContentVersions(contentItemId)
  const deleteVersionMutation = useDeleteContentVersion()
  const setPrimaryMutation = useSetPrimaryVersion()

  const handleDeleteVersion = async (version: ContentVersion) => {
    if (versions.length === 1) {
      alert('Cannot delete the last remaining version. Each content item must have at least one version.')
      return
    }

    if (!confirm(`Are you sure you want to delete the "${version.version_name}" version?`)) {
      return
    }

    try {
      await deleteVersionMutation.mutateAsync(version.id)
    } catch (error) {
      console.error('Failed to delete version:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete version'
      alert(errorMessage)
    }
  }

  const handleSetPrimary = async (version: ContentVersion) => {
    if (version.is_primary) return

    try {
      await setPrimaryMutation.mutateAsync(version.id)
    } catch (error) {
      console.error('Failed to set primary version:', error)
    }
  }


  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingCard showTitle={true} lines={3} />
      </div>
    )
  }

  return (
    <VStack spacing="md" className="p-4">
      <SectionHeader
        title={`Versions (${versions.length})`}
        level={3}
        actions={
          <ActionButton
            onClick={() => setShowCreateModal(true)}
            variant="primary"
          >
            Add Version
          </ActionButton>
        }
      />

      {versions.length === 0 ? (
        <VStack spacing="sm" align="center" className="py-8 text-gray-500">
          <p>No versions created yet</p>
          <p className="text-sm">Add versions like &quot;Director&apos;s Cut&quot;, &quot;Extended Edition&quot;, etc.</p>
        </VStack>
      ) : (
        <VStack spacing="sm">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`border rounded-lg p-4 ${
                version.is_primary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <VStack spacing="sm">
                <HStack justify="between" align="start">
                  <HStack spacing="sm" align="center">
                    <h4 className="font-medium text-gray-900">
                      {version.version_name}
                    </h4>
                    {version.is_primary && (
                      <StatusBadge status="Primary" variant="primary" />
                    )}
                  </HStack>
                  
                  <HStack spacing="sm">
                    {!version.is_primary && (
                      <ActionButton
                        onClick={() => handleSetPrimary(version)}
                        disabled={setPrimaryMutation.isPending}
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
                </HStack>

                {version.notes && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Notes:</span> {version.notes}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Created {new Date(version.created_at).toLocaleDateString()}
                </div>
              </VStack>
            </div>
          ))}
        </VStack>
      )}

      <CreateContentVersionModal
        contentItemId={contentItemId}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EditContentVersionModal
        version={editingVersion}
        isOpen={!!editingVersion}
        onClose={() => setEditingVersion(null)}
      />
    </VStack>
  )
}