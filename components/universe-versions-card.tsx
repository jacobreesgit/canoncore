'use client'

import { useState } from 'react'
import { useUniverseVersions } from '@/hooks/use-universe-versions'
import { CreateVersionModal } from './create-version-modal'
import { ActionButton } from './ui/action-button'

interface UniverseVersionsCardProps {
  universeId: string
}

export function UniverseVersionsCard({ universeId }: UniverseVersionsCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const { data: versions = [], isLoading } = useUniverseVersions(universeId)

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
          variant="warning"
          size="sm"
        >
          Create Version
        </ActionButton>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="mb-2">No versions created yet</p>
          <p className="text-xs">Create versions to save universe snapshots</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.slice(0, 3).map((version) => (
            <div
              key={version.id}
              className={`p-3 rounded border text-sm ${
                version.is_current ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {version.version_name}
                    </span>
                    {version.is_current && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  {version.commit_message && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {version.commit_message}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(version.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          
          {versions.length > 3 && (
            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">
                +{versions.length - 3} more versions
              </span>
            </div>
          )}
        </div>
      )}

      <CreateVersionModal
        universeId={universeId}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}