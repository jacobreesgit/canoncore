'use client'

import { useState } from 'react'
import { useCreateUniverseVersion, useNextVersionNumber } from '@/hooks/use-universe-versions'

interface CreateVersionModalProps {
  universeId: string
  isOpen: boolean
  onClose: () => void
}

export function CreateVersionModal({ universeId, isOpen, onClose }: CreateVersionModalProps) {
  const [versionName, setVersionName] = useState('')
  const [notes, setNotes] = useState('')
  
  const createVersion = useCreateUniverseVersion()
  const { data: nextVersionNumber, isLoading: loadingVersionNumber } = useNextVersionNumber(universeId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createVersion.mutateAsync({
        universeId,
        versionName: versionName.trim() || undefined,
        commitMessage: notes.trim() || undefined,
      })
      
      setVersionName('')
      setNotes('')
      onClose()
    } catch (error) {
      console.error('Failed to create version:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Version</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Version Number:</strong> {loadingVersionNumber ? 'Loading...' : `v${nextVersionNumber}`}
            </p>
          </div>
          
          <div>
            <label htmlFor="versionName" className="block text-sm font-medium text-gray-700 mb-1">
              Version Name
            </label>
            <input
              type="text"
              id="versionName"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`v${nextVersionNumber || ''}`}
              disabled={createVersion.isPending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use default: v{nextVersionNumber}
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what changed in this version..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={createVersion.isPending}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={createVersion.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={createVersion.isPending}
            >
              {createVersion.isPending ? 'Creating...' : 'Create Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}