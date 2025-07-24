'use client'

import { useDeleteUniverse } from '@/hooks/use-universes'
import { Universe } from '@/types/database'
import { useRouter } from 'next/navigation'
import { ConfirmationModal } from './ui'

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
    <ConfirmationModal
      isOpen={true}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Universe"
      message={`Are you sure you want to delete "${universe.name}"?`}
      warningMessage="This action cannot be undone. All content items, versions, and links in this universe will be permanently deleted."
      confirmText="Delete Universe"
      confirmColor="danger"
      isLoading={deleteUniverse.isPending}
    />
  )
}