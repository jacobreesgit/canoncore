'use client'

import { useState } from 'react'
import { useUniverseVersions } from '@/hooks/use-universe-versions'
import { useContentVersions, useDeleteContentVersion, useSetPrimaryVersion, ContentVersion } from '@/hooks/use-content-versions'
import { CreateVersionModal } from './create-version-modal'
import { CreateContentVersionModal } from './create-content-version-modal'
import { EditContentVersionModal } from './edit-content-version-modal'
import { ActionButton } from './ui/action-button'

interface VersionsCardProps {
  universeId?: string
  contentItemId?: string
}

export function VersionsCard({ universeId, contentItemId }: VersionsCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingVersion, setEditingVersion] = useState<ContentVersion | null>(null)

  // Universe versions hooks
  const { data: universeVersions = [], isLoading: universeLoading } = useUniverseVersions(universeId || '')
  
  // Content versions hooks
  const { data: contentVersions = [], isLoading: contentLoading } = useContentVersions(contentItemId || '')
  const deleteVersionMutation = useDeleteContentVersion()
  const setPrimaryMutation = useSetPrimaryVersion()

  const isUniverse = !!universeId
  const versions = isUniverse ? universeVersions : contentVersions
  const isLoading = isUniverse ? universeLoading : contentLoading

  const handleDeleteContentVersion = async (version: ContentVersion) => {
    if (contentVersions.length === 1) {
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
          variant={isUniverse ? 'warning' : 'primary'}
          size="sm"
        >
          {isUniverse ? 'Create Version' : 'Add Version'}
        </ActionButton>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="mb-2">No versions created yet</p>
          <p className="text-xs">
            {isUniverse 
              ? 'Create versions to save universe snapshots'
              : 'Add versions like "Director\'s Cut", "Extended Edition", etc.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => {
            const isCurrent = isUniverse ? (version as any).is_current : (version as ContentVersion).is_primary
            const badgeColor = isUniverse ? 'purple' : 'blue'
            
            return (
              <div
                key={version.id}
                className={`p-3 rounded border text-sm ${
                  isCurrent 
                    ? `border-${badgeColor}-200 bg-${badgeColor}-50` 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {version.version_name}
                      </span>
                      {isCurrent && (
                        <span className={`bg-${badgeColor}-100 text-${badgeColor}-800 text-xs font-medium px-2 py-1 rounded`}>
                          {isUniverse ? 'Current' : 'Primary'}
                        </span>
                      )}
                    </div>
                    {(isUniverse ? (version as any).commit_message : (version as ContentVersion).notes) && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {isUniverse ? (version as any).commit_message : (version as ContentVersion).notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isUniverse && !isCurrent && (
                      <ActionButton
                        onClick={() => handleSetPrimary(version as ContentVersion)}
                        disabled={setPrimaryMutation.isPending}
                        variant="primary"
                        size="xs"
                      >
                        Set Primary
                      </ActionButton>
                    )}
                    {!isUniverse && (
                      <>
                        <ActionButton
                          onClick={() => setEditingVersion(version as ContentVersion)}
                          variant="secondary"
                          size="xs"
                        >
                          Edit
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleDeleteContentVersion(version as ContentVersion)}
                          disabled={deleteVersionMutation.isPending || versions.length === 1}
                          variant="danger"
                          size="xs"
                          title={versions.length === 1 ? "Cannot delete the last version" : "Delete version"}
                        >
                          Delete
                        </ActionButton>
                      </>
                    )}
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(version.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {isUniverse && (
        <CreateVersionModal
          universeId={universeId!}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {!isUniverse && (
        <>
          <CreateContentVersionModal
            contentItemId={contentItemId!}
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
          <EditContentVersionModal
            version={editingVersion}
            isOpen={!!editingVersion}
            onClose={() => setEditingVersion(null)}
          />
        </>
      )}
    </div>
  )
}