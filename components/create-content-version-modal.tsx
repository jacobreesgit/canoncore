'use client'

import { useState } from 'react'
import { useCreateContentVersion, CreateContentVersionData } from '@/hooks/use-content-versions'

interface CreateContentVersionModalProps {
  contentItemId: string
  isOpen: boolean
  onClose: () => void
}


export function CreateContentVersionModal({ contentItemId, isOpen, onClose }: CreateContentVersionModalProps) {
  const [versionName, setVersionName] = useState('')
  const [notes, setNotes] = useState('')

  const createVersionMutation = useCreateContentVersion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!versionName.trim()) return

    const versionData: CreateContentVersionData = {
      content_item_id: contentItemId,
      version_name: versionName.trim(),
      notes: notes.trim() || undefined,
    }

    try {
      await createVersionMutation.mutateAsync(versionData)
      
      // Reset form
      setVersionName('')
      setNotes('')
      
      onClose()
    } catch (error) {
      console.error('Failed to create version:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Version</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="versionName" className="block text-sm font-medium text-gray-700 mb-1">
              Version Name *
            </label>
            <input
              type="text"
              id="versionName"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Director's Cut"
              required
            />
          </div>



          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional information about this version..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!versionName.trim() || createVersionMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {createVersionMutation.isPending ? 'Creating...' : 'Create Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}