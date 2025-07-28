'use client'

import { useState } from 'react'
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useConfirmationModal } from './use-confirmation-modal'
import { useToast } from './use-toast'

// Generic version interface - components pass their specific version type
export interface BaseVersion {
  id: string
  version_name: string
  created_at: string
  // Primary field names differ: is_primary for content, is_current for universe
  is_primary?: boolean
  is_current?: boolean
  // Description field names differ: notes for content, commit_message for universe
  notes?: string | null
  commit_message?: string | null
}

export interface VersionManagementConfig<T extends BaseVersion> {
  // Query hook for fetching versions
  useVersionsQuery: (entityId: string) => UseQueryResult<T[], Error>
  
  // Mutation hooks for CRUD operations
  useDeleteVersion: () => UseMutationResult<any, Error, any, unknown>
  useSetPrimaryVersion: () => UseMutationResult<any, Error, any, unknown>
  
  // Configuration for business rules
  minimumVersions?: number
  
  // Field mappings for different version types
  fieldMappings: {
    isPrimary: keyof T // 'is_primary' | 'is_current'
    description: keyof T // 'notes' | 'commit_message'
  }
  
  // Confirmation dialog options
  confirmationOptions: {
    deleteTitle: string
    deleteWarning: (versionName: string) => string
    lastVersionMessage: string
  }
  
  // Modal component props
  modals: {
    CreateModal: React.ComponentType<{
      entityId: string
      isOpen: boolean
      onClose: () => void
    }>
    EditModal: React.ComponentType<{
      version: T | null
      isOpen: boolean
      onClose: () => void
    }>
  }
  
  // Optional toast notifications (if not using confirmation modal)
  useToastNotifications?: boolean
}

export function useVersionManagement<T extends BaseVersion>(
  entityId: string,
  config: VersionManagementConfig<T>
) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingVersion, setEditingVersion] = useState<T | null>(null)
  
  const confirmationModal = useConfirmationModal()
  const toast = useToast()
  
  const { data: versions = [], isLoading } = config.useVersionsQuery(entityId)
  const deleteVersionMutation = config.useDeleteVersion()
  const setPrimaryMutation = config.useSetPrimaryVersion()
  
  const minimumVersions = config.minimumVersions ?? 1
  const useToastNotifications = config.useToastNotifications ?? false
  
  const handleDeleteVersion = async (version: T) => {
    if (versions.length <= minimumVersions) {
      if (useToastNotifications) {
        toast.warning(
          config.confirmationOptions.deleteTitle,
          config.confirmationOptions.lastVersionMessage
        )
      } else {
        confirmationModal.openModal({
          title: 'Cannot Delete Version',
          message: config.confirmationOptions.lastVersionMessage,
          confirmText: 'OK',
          confirmVariant: 'primary',
          onConfirm: () => {}, // Just close the modal
        })
      }
      return
    }

    const deleteAction = async () => {
      try {
        // Handle different mutation parameter patterns
        // Universe versions need {versionId, universeId}, content versions just need versionId
        const deleteParams = config.fieldMappings.isPrimary === 'is_current' 
          ? { versionId: version.id, universeId: entityId }
          : version.id
        
        await deleteVersionMutation.mutateAsync(deleteParams)
        
        if (useToastNotifications) {
          toast.success('Version Deleted', `"${version.version_name}" has been removed.`)
        }
      } catch (error) {
        console.error('Failed to delete version:', error)
        
        if (useToastNotifications) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete version'
          toast.error('Delete Failed', errorMessage)
        } else {
          // Error will be handled by the hook - modal stays open
          throw error
        }
      }
    }

    if (useToastNotifications) {
      if (!confirm(config.confirmationOptions.deleteWarning(version.version_name))) {
        return
      }
      await deleteAction()
    } else {
      confirmationModal.openModal({
        title: config.confirmationOptions.deleteTitle,
        message: config.confirmationOptions.deleteWarning(version.version_name),
        confirmText: 'Delete',
        confirmVariant: 'danger',
        onConfirm: deleteAction,
      })
    }
  }

  const handleSetPrimary = async (version: T) => {
    const isPrimary = version[config.fieldMappings.isPrimary] as boolean
    if (isPrimary) return

    try {
      // Handle different mutation parameter patterns
      // Universe versions need {universeId, versionId}, content versions just need versionId
      const setPrimaryParams = config.fieldMappings.isPrimary === 'is_current' 
        ? { universeId: entityId, versionId: version.id }
        : version.id
      
      await setPrimaryMutation.mutateAsync(setPrimaryParams)
    } catch (error) {
      console.error('Failed to set primary version:', error)
    }
  }

  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => setShowCreateModal(false)
  
  const openEditModal = (version: T) => setEditingVersion(version)
  const closeEditModal = () => setEditingVersion(null)

  return {
    // Data
    versions,
    isLoading,
    
    // State
    showCreateModal,
    editingVersion,
    
    // Actions
    handleDeleteVersion,
    handleSetPrimary,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    
    // Mutation states
    isDeleting: deleteVersionMutation.isPending,
    isSettingPrimary: setPrimaryMutation.isPending,
    
    // Modal props for confirmation
    confirmationModalProps: confirmationModal.modalProps,
    
    // Field mappings for rendering
    fieldMappings: config.fieldMappings,
    
    // Modal components
    CreateModal: config.modals.CreateModal,
    EditModal: config.modals.EditModal,
  }
}