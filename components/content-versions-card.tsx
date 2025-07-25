'use client'

import { useState } from 'react'
import { useContentVersions, useDeleteContentVersion, useSetPrimaryVersion, ContentVersion } from '@/hooks/use-content-versions'
import { CreateContentVersionModal } from './create-content-version-modal'
import { EditContentVersionModal } from './edit-content-version-modal'
import { ActionButton } from './ui/action-button'
import { Card, LoadingCard, StatusBadge, VStack, HStack, SectionHeader } from './ui'

interface ContentVersionsCardProps {
  contentItemId: string
}

export function ContentVersionsCard({ contentItemId }: ContentVersionsCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingVersion, setEditingVersion] = useState<ContentVersion | null>(null)
  
  const { data: versions = [], isLoading } = useContentVersions(contentItemId)
  const deleteVersionMutation = useDeleteContentVersion()
  const setPrimaryMutation = useSetPrimaryVersion()

  const handleDeleteContentVersion = async (version: ContentVersion) => {
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
      <Card>
        <LoadingCard showTitle={true} lines={3} />
      </Card>
    )
  }

  return (
    <Card>
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
          <p className="text-xs">Add versions like &quot;Director&apos;s Cut&quot;, &quot;Extended Edition&quot;, etc.</p>
        </VStack>
      ) : (
        <VStack spacing="sm">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-3 rounded border text-sm ${
                version.is_primary ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <VStack spacing="sm">
                <HStack justify="between" align="center">
                  <HStack spacing="sm" align="center">
                    <span className="font-medium text-gray-900">
                      {version.version_name}
                    </span>
                    {version.is_primary && (
                      <StatusBadge status="Primary" variant="primary" />
                    )}
                  </HStack>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(version.created_at).toLocaleDateString()}
                  </span>
                </HStack>
                
                {version.notes && (
                  <p className="text-xs text-gray-600 break-words">
                    {version.notes}
                  </p>
                )}
                
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
                    onClick={() => handleDeleteContentVersion(version)}
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
    </Card>
  )
}