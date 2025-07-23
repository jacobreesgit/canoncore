'use client'

import { useState } from 'react'
import { useUpdateUniverse } from '@/hooks/use-universes'
import { Universe } from '@/types/database'

interface EditUniverseModalProps {
  universe: Universe
  onClose: () => void
}

export function EditUniverseModal({ universe, onClose }: EditUniverseModalProps) {
  const [name, setName] = useState(universe.name)
  const [description, setDescription] = useState(universe.description || '')
  const updateUniverse = useUpdateUniverse()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await updateUniverse.mutateAsync({
        id: universe.id,
        updates: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      })
      onClose()
    } catch (error) {
      console.error('Failed to update universe:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Universe</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="e.g. Marvel Cinematic Universe"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="Brief description of your universe..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!name.trim() || updateUniverse.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {updateUniverse.isPending ? 'Updating...' : 'Update Universe'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}