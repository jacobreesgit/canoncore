import Link from 'next/link'
import { useState } from 'react'
import { Universe } from '@/types/database'
import { EditUniverseModal } from './edit-universe-modal'
import { DeleteUniverseModal } from './delete-universe-modal'

interface UniverseCardProps {
  universe: Universe
}

export function UniverseCard({ universe }: UniverseCardProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowEditModal(true)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  return (
    <>
      <div className="relative group p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
        <Link href={`/universes/${universe.slug}`} className="block">
          <h3 className="text-xl font-semibold mb-2">{universe.name}</h3>
          {universe.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {universe.description}
            </p>
          )}
          <div className="text-sm text-gray-500">
            Created {new Date(universe.created_at).toLocaleDateString()}
          </div>
        </Link>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={handleEditClick}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit universe"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete universe"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showEditModal && (
        <EditUniverseModal
          universe={universe}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteUniverseModal
          universe={universe}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}