import Link from 'next/link'
import { useState } from 'react'
import { Universe } from '@/types/database'
import { EditUniverseModal } from './edit-universe-modal'
import { DeleteUniverseModal } from './delete-universe-modal'
import { IconButton, EditIcon, DeleteIcon, Card, VStack, HStack } from '@/components/ui'

interface UniverseCardProps {
  universe: Universe
  selection?: {
    selectedItems: Set<string>
    isSelectionMode: boolean
    toggleSelection: (itemId: string) => void
  }
}

export function UniverseCard({ universe, selection }: UniverseCardProps) {
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
      <Card 
        className={`relative border transition-colors ${
          selection?.isSelectionMode && selection.selectedItems.has(universe.id)
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div 
          className={selection?.isSelectionMode ? 'cursor-pointer' : ''}
          onClick={selection?.isSelectionMode ? () => selection.toggleSelection(universe.id) : undefined}
        >
          {selection?.isSelectionMode && (
            <div className="absolute top-4 left-4 z-10">
              <input
                type="checkbox"
                checked={selection.selectedItems.has(universe.id)}
                onChange={() => {}} // Empty handler since parent handles click
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 pointer-events-none"
              />
            </div>
          )}
          
          {!selection?.isSelectionMode ? (
            <Link href={`/${universe.username}/${universe.slug}`} className="block">
              <VStack spacing="md">
                <h3 className="text-xl font-semibold">{universe.name}</h3>
                {universe.description && (
                  <p className="text-gray-600 line-clamp-3">
                    {universe.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  Created {new Date(universe.created_at).toLocaleDateString()}
                </div>
              </VStack>
            </Link>
          ) : (
            <div className="block">
              <VStack spacing="md">
                <h3 className="text-xl font-semibold">{universe.name}</h3>
                {universe.description && (
                  <p className="text-gray-600 line-clamp-3">
                    {universe.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  Created {new Date(universe.created_at).toLocaleDateString()}
                </div>
              </VStack>
            </div>
          )}
          
          {!selection?.isSelectionMode && (
            <div className="absolute top-2 right-2">
              <HStack spacing="xs">
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
              </HStack>
            </div>
          )}
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