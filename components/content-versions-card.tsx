'use client'

import { useState } from 'react'
import { useContentVersions, useDeleteContentVersion, useSetPrimaryVersion, ContentVersion } from '@/hooks/use-content-versions'
import { CreateContentVersionModal } from './create-content-version-modal'
import { EditContentVersionModal } from './edit-content-version-modal'
import { ActionButton } from './ui/action-button'
import { Card, LoadingCard, StatusBadge } from './ui'

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Versions ({versions.length})
        </h2>
        <ActionButton
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="sm"
        >
          Add Version
        </ActionButton>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="mb-2">No versions created yet</p>
          <p className="text-xs">Add versions like &quot;Director&apos;s Cut&quot;, &quot;Extended Edition&quot;, etc.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-3 rounded border text-sm ${
                version.is_primary ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {version.version_name}
                    </span>
                    {version.is_primary && (
                      <StatusBadge status="Primary" variant="primary" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(version.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {version.notes && (
                  <p className="text-xs text-gray-600 break-words">
                    {version.notes}
                  </p>
                )}
                
                <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>
          ))}
        </div>
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