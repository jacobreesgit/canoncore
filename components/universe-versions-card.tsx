'use client'

import { useState } from 'react'
import { useUniverseVersions, useSwitchUniverseVersion, useDeleteUniverseVersion, useUpdateUniverseVersion } from '@/hooks/use-universe-versions'
import { CreateVersionModal } from './create-version-modal'
import { EditUniverseVersionModal } from './edit-universe-version-modal'
import { ActionButton } from './ui/action-button'
import { UniverseVersion } from '@/types/database'

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
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
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
          <p className="text-xs">Create versions to save universe snapshots</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-3 rounded border text-sm ${
                version.is_current ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {version.version_name}
                    </span>
                    {version.is_current && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(version.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {version.commit_message && (
                  <p className="text-xs text-gray-600 break-words">
                    {version.commit_message}
                  </p>
                )}
                
                <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  )
}