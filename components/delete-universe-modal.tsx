'use client'

import { useDeleteUniverse } from '@/hooks/use-universes'
import { Universe } from '@/types/database'
import { useRouter } from 'next/navigation'

interface DeleteUniverseModalProps {
  universe: Universe
  onClose: () => void
}

export function DeleteUniverseModal({ universe, onClose }: DeleteUniverseModalProps) {
  const deleteUniverse = useDeleteUniverse()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteUniverse.mutateAsync(universe.id)
      router.push('/')
      onClose()
    } catch (error) {
      console.error('Failed to delete universe:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Universe</h2>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>"{universe.name}"</strong>?
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. All content items, versions, and links in this universe will be permanently deleted.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDelete}
              disabled={deleteUniverse.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {deleteUniverse.isPending ? 'Deleting...' : 'Delete Universe'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}