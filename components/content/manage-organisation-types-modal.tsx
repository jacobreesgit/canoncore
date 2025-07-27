'use client'

import { useState } from 'react'
import { BUILT_IN_ORGANISATION_TYPES, useCustomOrganisationTypes } from '@/hooks/use-custom-organisation-types'
import { useDisableOrganisationType, useEnableOrganisationType, useDisabledOrganisationTypes } from '@/hooks/use-disabled-organisation-types'
import { CustomOrganisationType } from '@/types/database'
import { CustomOrganisationTypeModal } from './custom-organisation-type-modal'
import { BaseModal, VStack, HStack, Grid, GridItem } from '@/components/ui'
import { ActionButton } from '@/components/ui'

interface ManageOrganisationTypesModalProps {
  universeId: string
  onClose: () => void
}

export function ManageOrganisationTypesModal({ universeId, onClose }: ManageOrganisationTypesModalProps) {
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false)
  const [editingCustomType, setEditingCustomType] = useState<CustomOrganisationType | undefined>()
  
  const customTypesQuery = useCustomOrganisationTypes(universeId)
  const disabledTypesQuery = useDisabledOrganisationTypes(universeId)
  const disableType = useDisableOrganisationType()
  const enableType = useEnableOrganisationType()
  
  const handleToggleBuiltInType = async (typeId: string) => {
    const isDisabled = disabledTypesQuery.data?.some(dt => dt.type_name === typeId)
    
    try {
      if (isDisabled) {
        await enableType.mutateAsync({ universeId, typeName: typeId })
      } else {
        await disableType.mutateAsync({ 
          universe_id: universeId, 
          type_name: typeId 
        })
      }
    } catch (error) {
      console.error('Failed to toggle organisation type:', error)
    }
  }
  
  const handleEditCustomType = (type: CustomOrganisationType) => {
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
      title="Manage Organisation Types"
      showCloseButton={true}
      size="xl"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        <VStack spacing="lg">
          {/* Built-in Organisation Types */}
          <VStack spacing="md">
            <VStack spacing="sm">
              <h3 className="text-lg font-medium">Built-in Organisation Types</h3>
              <p className="text-sm text-gray-600">
                Toggle built-in organisation types on/off for this universe. Disabled types won&apos;t appear in content creation.
              </p>
            </VStack>
            
            <Grid cols={{ base: 1, sm: 2 }} gap="sm">
              {BUILT_IN_ORGANISATION_TYPES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => {
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
                  </div>
                )
              })}
            </Grid>
          </VStack>
          
          {/* Custom Organisation Types */}
          <VStack spacing="md">
            <HStack justify="between" align="center">
              <h3 className="text-lg font-medium">Custom Organisation Types</h3>
              <ActionButton
                onClick={handleCreateCustomType}
                variant="primary"
                size="sm"
              >
                + Create Custom Type
              </ActionButton>
            </HStack>
            
            <p className="text-sm text-gray-600">
              Custom organisation types created specifically for this universe.
            </p>
            
            {customTypesQuery.data && customTypesQuery.data.length > 0 ? (
              <Grid cols={{ base: 1, sm: 2 }} gap="sm">
                {customTypesQuery.data.slice().sort((a, b) => a.name.localeCompare(b.name)).map((type) => (
                  <div
                    key={type.id}
                    className="p-3 border border-blue-200 bg-blue-50 rounded-lg"
                  >
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
                  </div>
                ))}
              </Grid>
            ) : (
              <VStack spacing="sm" align="center" className="py-8 text-gray-500">
                <p>No custom organisation types created yet.</p>
                <p className="text-sm">Click &quot;Create Custom Type&quot; to add your own.</p>
              </VStack>
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
        <CustomOrganisationTypeModal
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