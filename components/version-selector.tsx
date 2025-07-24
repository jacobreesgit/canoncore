'use client'

import { useContentVersions, usePrimaryContentVersion } from '@/hooks/use-content-versions'

interface VersionSelectorProps {
  contentItemId: string
  selectedVersionId?: string | null
  onVersionChange: (versionId: string | null) => void
  className?: string
}

export function VersionSelector({ 
  contentItemId, 
  selectedVersionId, 
  onVersionChange,
  className = '' 
}: VersionSelectorProps) {
  const { data: versions = [] } = useContentVersions(contentItemId)
  const { data: primaryVersion } = usePrimaryContentVersion(contentItemId)

  // Don't show selector if there are no versions or only one version
  if (versions.length <= 1) {
    return null
  }

  const currentSelection = selectedVersionId || primaryVersion?.id || ''

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="version-selector" className="text-sm font-medium text-gray-700">
        Version:
      </label>
      <select
        id="version-selector"
        value={currentSelection}
        onChange={(e) => onVersionChange(e.target.value || null)}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {version.version_name}
            {version.is_primary ? ' (Primary)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}