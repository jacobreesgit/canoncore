'use client'

import { useState } from 'react'
import { useUniverseVersions, useCurrentUniverseVersion, useSwitchUniverseVersion, useDeleteUniverseVersion, useRestoreUniverseVersion } from '@/hooks/use-universe-versions'
import { CreateVersionModal } from './create-version-modal'
import { ActionButton } from './ui/action-button'
import { IconButton } from './ui/icon-button'

interface VersionHistoryPanelProps {
  universeId: string
  isOpen: boolean
  onClose: () => void
}

export function VersionHistoryPanel({ universeId, isOpen, onClose }: VersionHistoryPanelProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingVersionId, setDeletingVersionId] = useState<string | null>(null)
  
  const { data: versions, isLoading } = useUniverseVersions(universeId)
  const { data: currentVersion } = useCurrentUniverseVersion(universeId)
  const switchVersion = useSwitchUniverseVersion()
  const deleteVersion = useDeleteUniverseVersion()
  const restoreVersion = useRestoreUniverseVersion()

  const handleSwitchVersion = async (versionId: string) => {
    try {
      await switchVersion.mutateAsync({ universeId, versionId })
    } catch (error) {
      console.error('Failed to switch version:', error)
    }
  }

  const handleDeleteVersion = async (versionId: string) => {
    if (!window.confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      return
    }

    try {
      await deleteVersion.mutateAsync({ versionId, universeId })
      setDeletingVersionId(null)
    } catch (error) {
      console.error('Failed to delete version:', error)
    }
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!window.confirm('Are you sure you want to restore to this version? This will replace all current content with the content from this version.')) {
      return
    }

    try {
      await restoreVersion.mutateAsync({ universeId, versionId, createNewVersion: true })
    } catch (error) {
      console.error('Failed to restore version:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Version History</h2>
            <div className="flex items-center space-x-3">
              <ActionButton
                onClick={() => setIsCreateModalOpen(true)}
                variant="primary"
                size="sm"
              >
                Create Version
              </ActionButton>
              <IconButton
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </IconButton>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading versions...</div>
            ) : !versions || versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No versions yet</p>
                <p className="text-sm mt-1">Create your first version to start tracking changes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 ${
                      version.is_current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{version.version_name}</h3>
                          {version.is_current && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        {version.commit_message && (
                          <p className="text-gray-600 text-sm mb-2">{version.commit_message}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Created {formatDate(version.created_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!version.is_current ? (
                          <>
                            <ActionButton
                              onClick={() => handleSwitchVersion(version.id)}
                              disabled={switchVersion.isPending}
                              isLoading={switchVersion.isPending}
                              variant="secondary"
                              size="xs"
                            >
                              {switchVersion.isPending ? 'Switching...' : 'Switch To'}
                            </ActionButton>
                            <ActionButton
                              onClick={() => handleRestoreVersion(version.id)}
                              disabled={restoreVersion.isPending}
                              isLoading={restoreVersion.isPending}
                              variant="success"
                              size="xs"
                            >
                              {restoreVersion.isPending ? 'Restoring...' : 'Restore'}
                            </ActionButton>
                            {versions.length > 1 && (
                              <ActionButton
                                onClick={() => handleDeleteVersion(version.id)}
                                disabled={deleteVersion.isPending && deletingVersionId === version.id}
                                isLoading={deleteVersion.isPending && deletingVersionId === version.id}
                                variant="danger"
                                size="xs"
                              >
                                {deleteVersion.isPending && deletingVersionId === version.id ? 'Deleting...' : 'Delete'}
                              </ActionButton>
                            )}
                          </>
                        ) : (
                          versions.length > 1 && (
                            <ActionButton
                              onClick={() => handleDeleteVersion(version.id)}
                              disabled={deleteVersion.isPending && deletingVersionId === version.id}
                              isLoading={deleteVersion.isPending && deletingVersionId === version.id}
                              variant="danger"
                              size="xs"
                            >
                              {deleteVersion.isPending && deletingVersionId === version.id ? 'Deleting...' : 'Delete'}
                            </ActionButton>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateVersionModal
        universeId={universeId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}