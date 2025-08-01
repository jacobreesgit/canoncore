'use client'

import { useState } from 'react'
import { useAllOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { useCustomOrganisationTypes, useDeleteCustomOrganisationType } from '@/hooks/use-custom-organisation-types'
import { useDisabledOrganisationTypes, useDisableOrganisationType, useEnableOrganisationType } from '@/hooks/use-disabled-organisation-types'
import { useConfirmationModal } from '@/hooks/use-confirmation-modal'
import { CustomOrganisationTypeModal } from './custom-organisation-type-modal'
import { ActionButton, Card, VStack, HStack, SectionHeader, ConfirmationModal, EmptyState, HeaderTitle } from '@/components/ui'

interface ContentManagementCardProps {
  universeId: string
}

const BUILT_IN_TYPES = [
  { id: 'collection', name: 'Collection' },
  { id: 'serial', name: 'Serial' },
  { id: 'story', name: 'Story' },
]

export function ContentManagementCard({ universeId }: ContentManagementCardProps) {
  const [showCreateCustomType, setShowCreateCustomType] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)
  
  const confirmationModal = useConfirmationModal()

  const { data: customTypes = [] } = useCustomOrganisationTypes(universeId)
  const { data: disabledTypes = [] } = useDisabledOrganisationTypes(universeId)
  const deleteCustomTypeMutation = useDeleteCustomOrganisationType()
  const disableTypeMutation = useDisableOrganisationType()
  const enableTypeMutation = useEnableOrganisationType()

  const isTypeDisabled = (typeId: string) => {
    return disabledTypes.some(disabled => disabled.type_name === typeId)
  }

  const handleToggleBuiltInType = async (typeId: string) => {
    const isDisabled = isTypeDisabled(typeId)
    
    try {
      if (isDisabled) {
        await enableTypeMutation.mutateAsync({ universeId, typeName: typeId })
      } else {
        await disableTypeMutation.mutateAsync({ 
          universe_id: universeId, 
          type_name: typeId 
        })
      }
    } catch (error) {
      console.error('Failed to toggle type:', error)
    }
  }

  const handleDeleteCustomType = (typeId: string, typeName: string) => {
    confirmationModal.openModal({
      title: 'Delete Organisation Type',
      message: `Are you sure you want to delete the "${typeName}" organisation type? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await deleteCustomTypeMutation.mutateAsync(typeId)
        } catch (error) {
          console.error('Failed to delete custom type:', error)
          throw error
        }
      },
    })
  }

  return (
    <Card>
      <VStack spacing="lg">
        <SectionHeader
          title="Organisation Types"
          level={3}
          actions={
            <ActionButton
              onClick={() => setShowCreateCustomType(true)}
              variant="info"
              size="sm"
            >
              Add Custom Type
            </ActionButton>
          }
        />

        {/* Built-in Types */}
        <VStack spacing="md">
          <HeaderTitle level={3} className="text-sm font-medium text-gray-700">Built-in Types</HeaderTitle>
          <VStack spacing="sm">
            {BUILT_IN_TYPES.map((type) => {
              const disabled = isTypeDisabled(type.id)
              return (
                <div
                  key={type.id}
                  className={`p-2 rounded border text-sm ${
                    disabled ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <HStack justify="between" align="center">
                    <span className={disabled ? 'text-red-700' : 'text-green-700'}>
                      {type.name}
                    </span>
                    <ActionButton
                      onClick={() => handleToggleBuiltInType(type.id)}
                      disabled={disableTypeMutation.isPending || enableTypeMutation.isPending}
                      variant={disabled ? 'success' : 'danger'}
                      size="xs"
                    >
                      {disabled ? 'Enable' : 'Disable'}
                    </ActionButton>
                  </HStack>
                </div>
              )
            })}
          </VStack>
        </VStack>

        {/* Custom Types */}
        <VStack spacing="md">
          <HeaderTitle level={3} className="text-sm font-medium text-gray-700">
            Custom Types ({customTypes.length})
          </HeaderTitle>
          {customTypes.length === 0 ? (
            <EmptyState
              title="No custom types created yet"
              size="sm"
            />
          ) : (
            <VStack spacing="sm">
              {customTypes.map((type) => (
                <div
                  key={type.id}
                  className="p-2 rounded border border-blue-200 bg-blue-50 text-sm"
                >
                  <HStack justify="between" align="center">
                    <span className="text-blue-700">{type.name}</span>
                    <HStack spacing="xs">
                      <ActionButton
                        onClick={() => setEditingType(type)}
                        variant="primary"
                        size="xs"
                      >
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteCustomType(type.id, type.name)}
                        disabled={deleteCustomTypeMutation.isPending}
                        variant="danger"
                        size="xs"
                      >
                        Delete
                      </ActionButton>
                    </HStack>
                  </HStack>
                </div>
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>

      {/* Modals */}
      {showCreateCustomType && (
        <CustomOrganisationTypeModal
          universeId={universeId}
          onClose={() => setShowCreateCustomType(false)}
        />
      )}

      {editingType && (
        <CustomOrganisationTypeModal
          universeId={universeId}
          onClose={() => setEditingType(null)}
          editingType={editingType}
        />
      )}
      
      {confirmationModal.modalProps && (
        <ConfirmationModal {...confirmationModal.modalProps} />
      )}
    </Card>
  )
}