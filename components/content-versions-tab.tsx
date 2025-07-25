'use client'

import { useState } from 'react'
import { useContentVersions, useDeleteContentVersion, useSetPrimaryVersion, ContentVersion } from '@/hooks/use-content-versions'
import { CreateContentVersionModal } from './create-content-version-modal'
import { EditContentVersionModal } from './edit-content-version-modal'
import { ActionButton } from './ui/action-button'
import { StatusBadge } from './ui'

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
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Versions ({versions.length})
        </h3>
        <ActionButton
          onClick={() => setShowCreateModal(true)}
          variant="primary"
        >
          Add Version
        </ActionButton>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No versions created yet</p>
          <p className="text-sm">Add versions like &quot;Director&apos;s Cut&quot;, &quot;Extended Edition&quot;, etc.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`border rounded-lg p-4 ${
                version.is_primary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {version.version_name}
                    </h4>
                    {version.is_primary && (
                      <StatusBadge status="Primary" variant="primary" />
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
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
                </div>
              </div>


              {version.notes && (
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Notes:</span> {version.notes}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500">
                Created {new Date(version.created_at).toLocaleDateString()}
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
    </div>
  )
}