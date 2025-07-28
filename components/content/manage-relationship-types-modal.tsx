'use client'

import { useState } from 'react'
import { BUILT_IN_RELATIONSHIP_TYPES, useCustomRelationshipTypes } from '@/hooks/use-custom-relationship-types'
import { useDisableRelationshipType, useEnableRelationshipType, useDisabledRelationshipTypes } from '@/hooks/use-disabled-relationship-types'
import { CustomRelationshipType } from '@/types/database'
import { CustomRelationshipTypeModal } from './custom-relationship-type-modal'
import { BaseModal, VStack, HStack, Grid, GridItem, EmptyState } from '@/components/ui'
import { ActionButton } from '@/components/ui'

interface ManageRelationshipTypesModalProps {
  universeId: string
  onClose: () => void
}

export function ManageRelationshipTypesModal({ universeId, onClose }: ManageRelationshipTypesModalProps) {
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false)
  const [editingCustomType, setEditingCustomType] = useState<CustomRelationshipType | undefined>()
  
  const customTypesQuery = useCustomRelationshipTypes(universeId)
  const disabledTypesQuery = useDisabledRelationshipTypes(universeId)
  const disableType = useDisableRelationshipType()
  const enableType = useEnableRelationshipType()
  
  const handleToggleBuiltInType = async (typeId: string) => {
    const isDisabled = disabledTypesQuery.data?.some(dt => dt.type_name === typeId)
    
    try {
      if (isDisabled) {
        // Find the disabled record to get its ID for deletion
        const disabledRecord = disabledTypesQuery.data?.find(dt => dt.type_name === typeId)
        if (disabledRecord) {
          await enableType.mutateAsync(disabledRecord.id)
        }
      } else {
        await disableType.mutateAsync({ 
          universe_id: universeId, 
          type_name: typeId 
        })
      }
    } catch (error) {
      console.error('Failed to toggle relationship type:', error)
    }
  }
  
  const handleEditCustomType = (type: CustomRelationshipType) => {
    setEditingCustomType(type)
    setShowCustomTypeModal(true)
  }
  
  const handleCreateCustomType = () => {
    setEditingCustomType(undefined)
    setShowCustomTypeModal(true)
  }
  
  const isLoading = disableType.isPending || enableType.isPending

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Manage Relationship Types"
      showCloseButton={true}
      size="xl"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        <VStack spacing="lg">
          {/* Built-in Relationship Types */}
          <VStack spacing="md">
            <VStack spacing="sm">
              <h3 className="text-lg font-medium">Built-in Relationship Types</h3>
              <p className="text-sm text-gray-600">
                Toggle built-in relationship types on/off for this universe. Disabled types won&apos;t appear when creating relationships.
              </p>
            </VStack>
            
            <Grid cols={{ base: 1, sm: 2 }} gap="sm">
              {BUILT_IN_RELATIONSHIP_TYPES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => {
                const isDisabled = disabledTypesQuery.data?.some(dt => dt.type_name === type.id)
                
                return (
                  <div
                    key={type.id}
                    className={`p-3 border rounded-lg transition-colors ${
                      isDisabled 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <VStack spacing="sm">
                      <HStack justify="between" align="center">
                        <span className={`font-medium ${isDisabled ? 'text-red-700' : 'text-green-700'}`}>
                          {type.name}
                        </span>
                        
                        <ActionButton
                          onClick={() => handleToggleBuiltInType(type.id)}
                          disabled={isLoading}
                          variant={isDisabled ? 'danger' : 'success'}
                          size="sm"
                        >
                          {isDisabled ? 'Enable' : 'Disable'}
                        </ActionButton>
                      </HStack>
                      
                      <p className={`text-xs ${isDisabled ? 'text-red-600' : 'text-green-600'}`}>
                        {type.description}
                      </p>
                    </VStack>
                  </div>
                )
              })}
            </Grid>
          </VStack>
          
          {/* Custom Relationship Types */}
          <VStack spacing="md">
            <HStack justify="between" align="center">
              <h3 className="text-lg font-medium">Custom Relationship Types</h3>
              <ActionButton
                onClick={handleCreateCustomType}
                variant="primary"
                size="sm"
              >
                + Create Custom Type
              </ActionButton>
            </HStack>
            
            <p className="text-sm text-gray-600">
              Custom relationship types created specifically for this universe.
            </p>
            
            {customTypesQuery.data && customTypesQuery.data.length > 0 ? (
              <Grid cols={{ base: 1, sm: 2 }} gap="sm">
                {customTypesQuery.data.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => (
                  <div
                    key={type.id}
                    className="p-3 border border-blue-200 bg-blue-50 rounded-lg"
                  >
                    <VStack spacing="sm">
                      <HStack justify="between" align="center">
                        <span className="font-medium text-blue-700">{type.name}</span>
                        
                        <ActionButton
                          onClick={() => handleEditCustomType(type)}
                          variant="primary"
                          size="sm"
                        >
                          Edit
                        </ActionButton>
                      </HStack>
                      
                      {type.description && (
                        <p className="text-xs text-blue-600">
                          {type.description}
                        </p>
                      )}
                    </VStack>
                  </div>
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="No custom relationship types created yet"
                description={`Click "Create Custom Type" to add your own.`}
                size="md"
              />
            )}
          </VStack>
        </VStack>
        
        <HStack justify="end" className="mt-6">
          <ActionButton
            onClick={onClose}
            variant="secondary"
          >
            Done
          </ActionButton>
        </HStack>
      </div>
      
      {showCustomTypeModal && (
        <CustomRelationshipTypeModal
          universeId={universeId}
          editingType={editingCustomType}
          onClose={() => {
            setShowCustomTypeModal(false)
            setEditingCustomType(undefined)
          }}
        />
      )}
    </BaseModal>
  )
}