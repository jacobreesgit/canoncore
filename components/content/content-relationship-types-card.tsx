'use client'

import { useState } from 'react'
import { BUILT_IN_RELATIONSHIP_TYPES, useCustomRelationshipTypes, useDeleteCustomRelationshipType } from '@/hooks/use-custom-relationship-types'
import { useDisabledRelationshipTypes, useDisableRelationshipType, useEnableRelationshipType } from '@/hooks/use-disabled-relationship-types'
import { CustomRelationshipTypeModal } from './custom-relationship-type-modal'
import { ActionButton, Card, VStack, HStack, SectionHeader } from '@/components/ui'

interface ContentRelationshipTypesCardProps {
  universeId: string
}

export function ContentRelationshipTypesCard({ universeId }: ContentRelationshipTypesCardProps) {
  const [showCreateCustomType, setShowCreateCustomType] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)

  const { data: customTypes = [] } = useCustomRelationshipTypes(universeId)
  const { data: disabledTypes = [] } = useDisabledRelationshipTypes(universeId)
  const deleteCustomTypeMutation = useDeleteCustomRelationshipType()
  const disableTypeMutation = useDisableRelationshipType()
  const enableTypeMutation = useEnableRelationshipType()

  const isTypeDisabled = (typeId: string) => {
    return disabledTypes.some(disabled => disabled.type_name === typeId)
  }

  const handleToggleBuiltInType = async (typeId: string) => {
    const isDisabled = isTypeDisabled(typeId)
    
    try {
      if (isDisabled) {
        // Find the disabled record to get its ID for deletion
        const disabledRecord = disabledTypes.find(disabled => disabled.type_name === typeId)
        if (disabledRecord) {
          await enableTypeMutation.mutateAsync(disabledRecord.id)
        }
      } else {
        await disableTypeMutation.mutateAsync({ 
          universe_id: universeId, 
          type_name: typeId 
        })
      }
    } catch (error) {
      console.error('Failed to toggle relationship type:', error)
    }
  }

  const handleDeleteCustomType = async (typeId: string, typeName: string) => {
    if (!confirm(`Are you sure you want to delete the "${typeName}" relationship type?`)) {
      return
    }

    try {
      await deleteCustomTypeMutation.mutateAsync(typeId)
    } catch (error) {
      console.error('Failed to delete custom relationship type:', error)
    }
  }

  return (
    <Card>
      <VStack spacing="lg">
        <SectionHeader
          title="Relationship Types"
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
          <h3 className="text-sm font-medium text-gray-700">Built-in Types</h3>
          <VStack spacing="sm">
            {BUILT_IN_RELATIONSHIP_TYPES.map((type) => {
              const disabled = isTypeDisabled(type.id)
              return (
                <div
                  key={type.id}
                  className={`p-2 rounded border text-sm ${
                    disabled ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <VStack spacing="xs">
                    <HStack justify="between" align="center">
                      <span className={disabled ? 'text-red-700' : 'text-green-700 font-medium'}>
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
                    <p className={`text-xs ${disabled ? 'text-red-600' : 'text-green-600'}`}>
                      {type.description}
                    </p>
                  </VStack>
                </div>
              )
            })}
          </VStack>
        </VStack>

        {/* Custom Types */}
        <VStack spacing="md">
          <h3 className="text-sm font-medium text-gray-700">
            Custom Types ({customTypes.length})
          </h3>
          {customTypes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No custom relationship types created yet</p>
            </div>
          ) : (
            <VStack spacing="sm">
              {customTypes.map((type) => (
                <div
                  key={type.id}
                  className="p-2 rounded border border-blue-200 bg-blue-50 text-sm"
                >
                  <VStack spacing="xs">
                    <HStack justify="between" align="center">
                      <span className="text-blue-700 font-medium">{type.name}</span>
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
                    {type.description && (
                      <p className="text-xs text-blue-600">
                        {type.description}
                      </p>
                    )}
                  </VStack>
                </div>
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>

      {/* Modals */}
      {showCreateCustomType && (
        <CustomRelationshipTypeModal
          universeId={universeId}
          onClose={() => setShowCreateCustomType(false)}
        />
      )}

      {editingType && (
        <CustomRelationshipTypeModal
          universeId={universeId}
          onClose={() => setEditingType(null)}
          editingType={editingType}
        />
      )}
    </Card>
  )
}