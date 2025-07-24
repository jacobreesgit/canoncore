import Link from 'next/link'
import { useState } from 'react'
import { Universe } from '@/types/database'
import { EditUniverseModal } from './edit-universe-modal'
import { DeleteUniverseModal } from './delete-universe-modal'
import { IconButton, EditIcon, DeleteIcon } from './ui/icon-button'
import { Card } from './ui/card'

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
      <Card className="relative border border-gray-200 hover:border-blue-300 transition-colors">
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
        
        <div className="absolute top-2 right-2 flex gap-1">
          <IconButton
            onClick={handleEditClick}
            variant="primary"
            aria-label="Edit universe"
            title="Edit universe"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={handleDeleteClick}
            variant="danger"
            aria-label="Delete universe"
            title="Delete universe"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </Card>

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